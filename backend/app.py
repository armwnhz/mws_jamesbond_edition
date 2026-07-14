import sys
import re
import csv
import json
import os
import logging
import io
import zipfile
from urllib.parse import urljoin, urlparse
from typing import List, Dict, Optional
from dataclasses import dataclass, asdict
from datetime import datetime, timedelta, timezone

import requests
from fastapi import FastAPI, HTTPException, status, Request, Response, Query, WebSocket, WebSocketDisconnect
from fastapi.responses import JSONResponse, StreamingResponse
from fastapi.middleware.cors import CORSMiddleware


# ========== CORS – تنظیم کامل و نهایی ==========
FRONTEND_URL = os.getenv("FRONTEND_URL", "https://mws-frontend-6dl0.onrender.com")
ALLOWED_ORIGINS = [
    FRONTEND_URL,
    "https://mws-frontend-6dl0.onrender.com",
    "https://mws-frontend.onrender.com",
    "http://localhost:3000",
    "http://localhost:3001",
    "http://127.0.0.1:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],   # ✅ OPTIONS را اضافه کنید
    allow_headers=["*"],
    expose_headers=["*"],
)

# ========== هندلر اختصاصی برای OPTIONS ==========
@app.options("/{full_path:path}")
async def options_handler(request: Request):
    response = Response()
    origin = request.headers.get("origin")
    if origin in ALLOWED_ORIGINS:
        response.headers["Access-Control-Allow-Origin"] = origin
        response.headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, OPTIONS"
        response.headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization, Cookie, Accept"
        response.headers["Access-Control-Allow-Credentials"] = "true"
        response.headers["Access-Control-Max-Age"] = "86400"
    return response
from pydantic import BaseModel, EmailStr, Field
import uvicorn

from sqlalchemy import create_engine, Column, Integer, String, DateTime, JSON, Text, ForeignKey, inspect, text
from sqlalchemy.orm import declarative_base, sessionmaker, Session, relationship

import bcrypt
from jose import JWTError, jwt
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from bs4 import BeautifulSoup

# ========== تنظیمات محیطی ==========
SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-key-change-this-in-production")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24
IS_PRODUCTION = os.getenv("ENV") == "production"  # در Render: ENV=production

# ========== لاگ ==========
logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s")
logger = logging.getLogger(__name__)

# ========== FastAPI ==========
app = FastAPI(
    title="Minouta Web Scraper API",
    version="4.2.1",
    description="Web Scraper with authentication, history, search, delete, trash, deep crawling, charts",
)

# Rate Limiter
limiter = Limiter(key_func=get_remote_address)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# ========== CORS – تنظیم کامل و صحیح ==========
FRONTEND_URL = os.getenv("FRONTEND_URL", "https://mws-frontend.onrender.com")
ALLOWED_ORIGINS = [
    FRONTEND_URL,
    "http://localhost:3000",
    "http://localhost:3001",
    "http://127.0.0.1:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,        # اجازه ارسال کوکی
    allow_methods=["*"],           # همه متدها (GET, POST, OPTIONS, ...)
    allow_headers=["*"],           # همه هدرها
    expose_headers=["*"],          # هدرهای خروجی
)

# ========== هندلر دستی برای OPTIONS (در صورت لزوم) ==========
@app.options("/{full_path:path}")
async def options_handler(request: Request):
    response = Response()
    origin = request.headers.get("origin")
    if origin in ALLOWED_ORIGINS:
        response.headers["Access-Control-Allow-Origin"] = origin
        response.headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, OPTIONS"
        response.headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization, Cookie, Accept"
        response.headers["Access-Control-Allow-Credentials"] = "true"
        response.headers["Access-Control-Max-Age"] = "86400"
    return response

# ========== مدل‌های داده ==========
class UserCreate(BaseModel):
    username: str = Field(..., min_length=3, max_length=50)
    email: EmailStr
    password: str = Field(..., min_length=6)

class UserLogin(BaseModel):
    username: str
    password: str

class UserResponse(BaseModel):
    id: int
    username: str
    email: str
    created_at: datetime

class ChangePassword(BaseModel):
    old_password: str
    new_password: str = Field(..., min_length=6)

class ScrapeRequest(BaseModel):
    urls: List[str]
    timeout: Optional[int] = 10
    user_agent: Optional[str] = None
    proxy: Optional[str] = None
    extract_mobile: bool = True
    extract_landline: bool = True
    extract_email: bool = True
    extract_links: bool = False
    extract_instagram: bool = False
    extract_youtube: bool = False
    save_history: bool = True
    depth: Optional[int] = 0

class HistorySearch(BaseModel):
    url: Optional[str] = None
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    has_mobile: Optional[bool] = None
    has_email: Optional[bool] = None
    show_deleted: Optional[bool] = False

# ========== توابع کمکی ==========
def get_password_hash(password: str) -> str:
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(password.encode('utf-8'), salt).decode('utf-8')

def verify_password(plain: str, hashed: str) -> bool:
    try:
        return bcrypt.checkpw(plain.encode('utf-8'), hashed.encode('utf-8'))
    except ValueError:
        return False

def create_access_token(data: dict, expires_delta: timedelta = None):
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + (expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

async def get_current_user(request: Request):
    token = request.cookies.get("access_token")
    if not token:
        return None
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = int(payload.get("sub"))
    except:
        return None
    db = SessionLocal()
    user = db.query(User).filter(User.id == user_id).first()
    db.close()
    return user

async def get_current_user_required(request: Request):
    user = await get_current_user(request)
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    return user

# ========== Regex ==========
_MOBILE_REGEX = re.compile(r'(?<!\d)(?:0|\+98)9[0-9]{9}(?!\d)')
_LANDLINE_REGEX = re.compile(r'(?<!\d)(?:\+98|0098)?0[1-8][0-9]{9}(?!\d)')
_EMAIL_REGEX = re.compile(r'[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}', re.IGNORECASE)
_INSTAGRAM_REGEX = re.compile(r'https?://(?:www\.)?instagram\.com/([a-zA-Z0-9_.]+)/?', re.IGNORECASE)
_YOUTUBE_REGEX = re.compile(r'https?://(?:www\.)?youtube\.com/(?:@|c/|user/|channel/)([a-zA-Z0-9_-]+)/?', re.IGNORECASE)

def extract_phones(text):
    mobiles = list(dict.fromkeys(_MOBILE_REGEX.findall(text)))
    landlines = list(dict.fromkeys(_LANDLINE_REGEX.findall(text)))
    return mobiles, landlines

def extract_emails(text):
    return list(dict.fromkeys(_EMAIL_REGEX.findall(text)))

def extract_instagram_handles(text):
    return list(dict.fromkeys(_INSTAGRAM_REGEX.findall(text)))

def extract_youtube_handles(text):
    return list(dict.fromkeys(_YOUTUBE_REGEX.findall(text)))

def extract_links_from_html(html, base_url):
    soup = BeautifulSoup(html, 'html.parser')
    links = []
    for a in soup.find_all('a', href=True):
        full = urljoin(base_url, a['href'])
        if full.startswith(('http://', 'https://')):
            links.append(full)
    return list(dict.fromkeys(links))

def normalize_url(url: str) -> str:
    url = url.strip()
    if not url.startswith(('http://', 'https://')):
        return 'https://' + url
    return url

def fetch_content(url, timeout=10, user_agent=None, proxy=None):
    headers = {'User-Agent': user_agent or "Mozilla/5.0"}
    proxies = {'http': proxy, 'https': proxy} if proxy else None
    resp = requests.get(url, headers=headers, proxies=proxies, timeout=timeout)
    resp.raise_for_status()
    return resp.text

# ========== Scraper Engine ==========
@dataclass
class ScrapeResult:
    url: str
    timestamp: datetime
    mobiles: List[str]
    landlines: List[str]
    emails: List[str]
    links: List[str]
    instagram: List[str]
    youtube: List[str]

class ScraperEngine:
    def __init__(self, timeout=10, user_agent=None, proxy=None):
        self.timeout = timeout
        self.user_agent = user_agent
        self.proxy = proxy

    async def scrape_url(self, url, options):
        url = normalize_url(url)
        html = fetch_content(url, self.timeout, self.user_agent, self.proxy)
        mobiles, landlines = [], []
        if options.get('extract_mobile') or options.get('extract_landline'):
            mobiles, landlines = extract_phones(html)
            if not options.get('extract_mobile'):
                mobiles = []
            if not options.get('extract_landline'):
                landlines = []
        emails = extract_emails(html) if options.get('extract_email') else []
        links = extract_links_from_html(html, url) if options.get('extract_links') else []
        instagram = extract_instagram_handles(html) if options.get('extract_instagram') else []
        youtube = extract_youtube_handles(html) if options.get('extract_youtube') else []
        return ScrapeResult(
            url=url,
            timestamp=datetime.now(),
            mobiles=mobiles,
            landlines=landlines,
            emails=emails,
            links=links,
            instagram=instagram,
            youtube=youtube
        )

    async def scrape_with_crawling(self, start_url, depth, options):
        results = []
        visited = set()
        to_visit = [(start_url, 0)]
        base_domain = urlparse(start_url).netloc
        while to_visit:
            current_url, current_depth = to_visit.pop(0)
            if current_url in visited or current_depth > depth:
                continue
            visited.add(current_url)
            try:
                result = await self.scrape_url(current_url, options)
                results.append(result)
                if current_depth < depth and options.get('extract_links'):
                    for link in result.links:
                        if urlparse(link).netloc == base_domain and link not in visited:
                            to_visit.append((link, current_depth + 1))
            except Exception as e:
                logger.error(f"Error scraping {current_url}: {e}")
        return results

# ========== Database ==========
DATABASE_URL = os.getenv("DATABASE_URL")
if DATABASE_URL:
    SQLALCHEMY_DATABASE_URL = DATABASE_URL
else:
    import tempfile
    db_path = os.path.join(tempfile.gettempdir(), "scraper.db")
    SQLALCHEMY_DATABASE_URL = f"sqlite:///{db_path}"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False} if "sqlite" in SQLALCHEMY_DATABASE_URL else {},
    pool_pre_ping=True,
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, nullable=False)
    email = Column(String, unique=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.now)
    histories = relationship("ScrapeHistory", back_populates="user", cascade="all, delete-orphan")

class ScrapeHistory(Base):
    __tablename__ = "scrape_history"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    url = Column(String, index=True)
    timestamp = Column(DateTime, default=datetime.now)
    mobiles = Column(JSON, default=list)
    landlines = Column(JSON, default=list)
    emails = Column(JSON, default=list)
    links = Column(JSON, default=list)
    instagram = Column(JSON, default=list)
    youtube = Column(JSON, default=list)
    raw_data = Column(Text, nullable=True)
    deleted_at = Column(DateTime, nullable=True)
    user = relationship("User", back_populates="histories")

try:
    with engine.connect() as conn:
        inspector = inspect(engine)
        if "scrape_history" in inspector.get_table_names():
            cols = [c['name'] for c in inspector.get_columns('scrape_history')]
            if 'deleted_at' not in cols:
                conn.execute(text("ALTER TABLE scrape_history ADD COLUMN deleted_at DateTime"))
                conn.commit()
except Exception as e:
    logger.warning(f"Could not add deleted_at: {e}")

Base.metadata.create_all(bind=engine)

class DatabaseManager:
    def __init__(self, session=None):
        self.session = session or SessionLocal()

    def save_result(self, user_id, result: ScrapeResult, raw_html=None):
        history = ScrapeHistory(
            user_id=user_id,
            url=result.url,
            timestamp=result.timestamp,
            mobiles=result.mobiles,
            landlines=result.landlines,
            emails=result.emails,
            links=result.links,
            instagram=result.instagram,
            youtube=result.youtube,
            raw_data=raw_html,
            deleted_at=None
        )
        self.session.add(history)
        self.session.commit()
        return history.id

    def get_user_history(self, user_id, limit=100, offset=0, search: HistorySearch = None):
        query = self.session.query(ScrapeHistory).filter(ScrapeHistory.user_id == user_id)
        if search and search.show_deleted:
            query = query.filter(ScrapeHistory.deleted_at != None)
        else:
            query = query.filter(ScrapeHistory.deleted_at == None)
        if search:
            if search.url:
                query = query.filter(ScrapeHistory.url.contains(search.url))
            if search.start_date:
                query = query.filter(ScrapeHistory.timestamp >= search.start_date)
            if search.end_date:
                query = query.filter(ScrapeHistory.timestamp <= search.end_date)
            if search.has_mobile is not None:
                if search.has_mobile:
                    query = query.filter(ScrapeHistory.mobiles != [])
                else:
                    query = query.filter(ScrapeHistory.mobiles == [])
            if search.has_email is not None:
                if search.has_email:
                    query = query.filter(ScrapeHistory.emails != [])
                else:
                    query = query.filter(ScrapeHistory.emails == [])
        return query.order_by(ScrapeHistory.timestamp.desc()).offset(offset).limit(limit).all()

    def get_history_by_id(self, history_id, user_id):
        return self.session.query(ScrapeHistory).filter(ScrapeHistory.id == history_id, ScrapeHistory.user_id == user_id).first()

    def get_history_count(self, user_id, search=None):
        query = self.session.query(ScrapeHistory).filter(ScrapeHistory.user_id == user_id)
        if search and search.show_deleted:
            query = query.filter(ScrapeHistory.deleted_at != None)
        else:
            query = query.filter(ScrapeHistory.deleted_at == None)
        if search:
            if search.url:
                query = query.filter(ScrapeHistory.url.contains(search.url))
            if search.start_date:
                query = query.filter(ScrapeHistory.timestamp >= search.start_date)
            if search.end_date:
                query = query.filter(ScrapeHistory.timestamp <= search.end_date)
            if search.has_mobile is not None:
                if search.has_mobile:
                    query = query.filter(ScrapeHistory.mobiles != [])
                else:
                    query = query.filter(ScrapeHistory.mobiles == [])
            if search.has_email is not None:
                if search.has_email:
                    query = query.filter(ScrapeHistory.emails != [])
                else:
                    query = query.filter(ScrapeHistory.emails == [])
        return query.count()

    def delete_history(self, history_id, user_id, permanent=False):
        history = self.session.query(ScrapeHistory).filter(ScrapeHistory.id == history_id, ScrapeHistory.user_id == user_id).first()
        if not history:
            return False
        if permanent:
            self.session.delete(history)
        else:
            history.deleted_at = datetime.now()
        self.session.commit()
        return True

    def delete_all_history(self, user_id, permanent=False):
        if permanent:
            count = self.session.query(ScrapeHistory).filter(ScrapeHistory.user_id == user_id, ScrapeHistory.deleted_at != None).delete()
        else:
            count = self.session.query(ScrapeHistory).filter(ScrapeHistory.user_id == user_id, ScrapeHistory.deleted_at == None).update({ScrapeHistory.deleted_at: datetime.now()})
        self.session.commit()
        return count

    def restore_history(self, history_id, user_id):
        history = self.session.query(ScrapeHistory).filter(ScrapeHistory.id == history_id, ScrapeHistory.user_id == user_id, ScrapeHistory.deleted_at != None).first()
        if not history:
            return False
        history.deleted_at = None
        self.session.commit()
        return True

    def restore_all_history(self, user_id):
        count = self.session.query(ScrapeHistory).filter(ScrapeHistory.user_id == user_id, ScrapeHistory.deleted_at != None).update({ScrapeHistory.deleted_at: None})
        self.session.commit()
        return count

    def close(self):
        self.session.close()

# ================================================================
#  مسیرها (Routes)
# ================================================================

# --------------------- احراز هویت ---------------------
@app.post("/auth/register")
@limiter.limit("5/minute")
async def register(request: Request, data: UserCreate):
    db = SessionLocal()
    if db.query(User).filter((User.username == data.username) | (User.email == data.email)).first():
        db.close()
        raise HTTPException(400, "Username or email exists")
    hashed = get_password_hash(data.password)
    user = User(username=data.username, email=data.email, hashed_password=hashed)
    db.add(user)
    db.commit()
    db.refresh(user)
    db.close()
    return {"message": "User created", "user_id": user.id}

@app.post("/auth/login")
@limiter.limit("10/minute")
async def login(request: Request, data: UserLogin, response: Response):
    db = SessionLocal()
    user = db.query(User).filter(User.username == data.username).first()
    db.close()
    if not user or not verify_password(data.password, user.hashed_password):
        raise HTTPException(401, "Invalid credentials")
    token = create_access_token({"sub": str(user.id)})
    
    # ========== تنظیم کوکی ==========
    response.set_cookie(
        key="access_token",
        value=token,
        httponly=True,
        max_age=ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        secure=IS_PRODUCTION,                # در تولید True
        samesite="none" if IS_PRODUCTION else "lax",
        path="/",
        domain=None,
    )
    return {"message": "Login successful", "username": user.username}

@app.post("/auth/logout")
async def logout(response: Response):
    response.delete_cookie("access_token", path="/")
    return {"message": "Logged out"}

@app.get("/auth/me")
async def get_me(request: Request):
    user = await get_current_user(request)
    if not user:
        raise HTTPException(401, "Not authenticated")
    return UserResponse(id=user.id, username=user.username, email=user.email, created_at=user.created_at)

@app.post("/auth/change-password")
async def change_password(request: Request, data: ChangePassword):
    user = await get_current_user_required(request)
    if not verify_password(data.old_password, user.hashed_password):
        raise HTTPException(400, "Old password is incorrect")
    db = SessionLocal()
    db_user = db.query(User).filter(User.id == user.id).first()
    db_user.hashed_password = get_password_hash(data.new_password)
    db.commit()
    db.close()
    return {"message": "Password changed successfully"}

# --------------------- اسکرپ ---------------------
@app.post("/scrape")
async def scrape(request: Request, req: ScrapeRequest):
    user = await get_current_user_required(request)
    engine = ScraperEngine(timeout=req.timeout, user_agent=req.user_agent, proxy=req.proxy)
    results = []
    db = DatabaseManager()
    options = {
        'extract_mobile': req.extract_mobile,
        'extract_landline': req.extract_landline,
        'extract_email': req.extract_email,
        'extract_links': req.extract_links,
        'extract_instagram': req.extract_instagram,
        'extract_youtube': req.extract_youtube
    }
    for url in req.urls:
        try:
            if req.depth > 0:
                crawl_results = await engine.scrape_with_crawling(url, req.depth, options)
                for r in crawl_results:
                    if req.save_history:
                        db.save_result(user.id, r)
                    results.append(asdict(r))
            else:
                r = await engine.scrape_url(url, options)
                if req.save_history:
                    db.save_result(user.id, r)
                results.append(asdict(r))
        except Exception as e:
            logger.error(f"Error scraping {url}: {e}")
            results.append({"url": url, "error": str(e)})
    db.close()
    return {"results": results}

# --------------------- مسیرهای خاص تاریخچه ---------------------
@app.get("/history")
async def get_history(
    request: Request,
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=100),
    url: Optional[str] = None,
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
    has_mobile: Optional[bool] = None,
    has_email: Optional[bool] = None,
    show_deleted: bool = False
):
    user = await get_current_user_required(request)
    search = HistorySearch(
        url=url, start_date=start_date, end_date=end_date,
        has_mobile=has_mobile, has_email=has_email, show_deleted=show_deleted
    )
    db = DatabaseManager()
    offset = (page - 1) * limit
    items = db.get_user_history(user.id, limit, offset, search)
    total = db.get_history_count(user.id, search)
    db.close()
    return {
        "items": [
            {
                "id": r.id,
                "url": r.url,
                "timestamp": r.timestamp.isoformat(),
                "deleted_at": r.deleted_at.isoformat() if r.deleted_at else None,
                "mobiles": r.mobiles,
                "landlines": r.landlines,
                "emails": r.emails,
                "links": r.links,
                "instagram": r.instagram,
                "youtube": r.youtube
            } for r in items
        ],
        "total": total,
        "page": page,
        "limit": limit,
        "pages": (total + limit - 1) // limit if total > 0 else 1
    }

@app.delete("/history/delete-all")
async def delete_all_history(request: Request):
    user = await get_current_user_required(request)
    db = DatabaseManager()
    count = db.delete_all_history(user.id, permanent=False)
    db.close()
    return {"message": f"{count} record(s) moved to trash"}

@app.delete("/history/bulk-delete")
async def bulk_delete_history(request: Request, time_range: str):
    user = await get_current_user_required(request)
    db = DatabaseManager()
    now = datetime.now()
    count = 0
    if time_range == "recent":
        records = db.get_user_history(user.id, limit=10, offset=0)
        for r in records:
            if db.delete_history(r.id, user.id, permanent=False):
                count += 1
    elif time_range == "hour":
        cutoff = now - timedelta(hours=1)
        count = db.session.query(ScrapeHistory).filter(
            ScrapeHistory.user_id == user.id,
            ScrapeHistory.timestamp >= cutoff,
            ScrapeHistory.deleted_at == None
        ).update({ScrapeHistory.deleted_at: now})
        db.session.commit()
    elif time_range == "week":
        cutoff = now - timedelta(days=7)
        count = db.session.query(ScrapeHistory).filter(
            ScrapeHistory.user_id == user.id,
            ScrapeHistory.timestamp >= cutoff,
            ScrapeHistory.deleted_at == None
        ).update({ScrapeHistory.deleted_at: now})
        db.session.commit()
    else:
        raise HTTPException(400, "Invalid time_range")
    db.close()
    return {"message": f"{count} record(s) moved to trash"}

@app.delete("/history/trash/empty")
async def empty_trash(request: Request):
    user = await get_current_user_required(request)
    db = DatabaseManager()
    count = db.delete_all_history(user.id, permanent=True)
    db.close()
    return {"message": f"Permanently deleted {count} records"}

@app.post("/history/trash/restore-all")
async def restore_all_trash(request: Request):
    user = await get_current_user_required(request)
    db = DatabaseManager()
    count = db.restore_all_history(user.id)
    db.close()
    return {"message": f"Restored {count} records"}

@app.get("/history/export")
async def export_history(request: Request, format: str = "json"):
    user = await get_current_user_required(request)
    db = DatabaseManager()
    records = db.get_user_history(user.id, limit=1000)
    db.close()
    data = [{
        "id": r.id,
        "url": r.url,
        "timestamp": r.timestamp.isoformat(),
        "mobiles": r.mobiles,
        "landlines": r.landlines,
        "emails": r.emails,
        "links": r.links,
        "instagram": r.instagram,
        "youtube": r.youtube
    } for r in records]

    if format == "json":
        content = json.dumps(data, indent=2, ensure_ascii=False)
        return Response(content=content, media_type="application/json",
                        headers={"Content-Disposition": "attachment; filename=history.json"})
    elif format == "csv":
        output = io.StringIO()
        writer = csv.DictWriter(output, fieldnames=["id","url","timestamp","mobiles","landlines","emails","links","instagram","youtube"])
        writer.writeheader()
        for row in data:
            row_copy = {k: ", ".join(v) if isinstance(v, list) else v for k, v in row.items()}
            writer.writerow(row_copy)
        return Response(content=output.getvalue(), media_type="text/csv",
                        headers={"Content-Disposition": "attachment; filename=history.csv"})
    else:
        lines = []
        for item in data:
            lines.append(f"ID: {item['id']}")
            lines.append(f"URL: {item['url']}")
            lines.append(f"Time: {item['timestamp']}")
            for key in ["mobiles","landlines","emails","links","instagram","youtube"]:
                if item[key]:
                    lines.append(f"{key}: {', '.join(item[key])}")
            lines.append("")
        content = "\n".join(lines)
        return Response(content=content, media_type="text/plain",
                        headers={"Content-Disposition": "attachment; filename=history.txt"})

@app.get("/history/export/zip")
async def export_history_zip(request: Request):
    user = await get_current_user_required(request)
    db = DatabaseManager()
    records = db.get_user_history(user.id, limit=1000)
    db.close()
    zip_buffer = io.BytesIO()
    with zipfile.ZipFile(zip_buffer, 'w', zipfile.ZIP_DEFLATED) as zf:
        json_data = json.dumps([{
            "id": r.id,
            "url": r.url,
            "timestamp": r.timestamp.isoformat(),
            "mobiles": r.mobiles,
            "landlines": r.landlines,
            "emails": r.emails,
            "links": r.links,
            "instagram": r.instagram,
            "youtube": r.youtube
        } for r in records], indent=2, ensure_ascii=False)
        zf.writestr("history.json", json_data)

        csv_out = io.StringIO()
        writer = csv.DictWriter(csv_out, fieldnames=["id","url","timestamp","mobiles","landlines","emails","links","instagram","youtube"])
        writer.writeheader()
        for r in records:
            writer.writerow({
                "id": r.id,
                "url": r.url,
                "timestamp": r.timestamp.isoformat(),
                "mobiles": ", ".join(r.mobiles),
                "landlines": ", ".join(r.landlines),
                "emails": ", ".join(r.emails),
                "links": ", ".join(r.links),
                "instagram": ", ".join(r.instagram),
                "youtube": ", ".join(r.youtube)
            })
        zf.writestr("history.csv", csv_out.getvalue())

        txt_lines = []
        for r in records:
            txt_lines.append(f"ID: {r.id}")
            txt_lines.append(f"URL: {r.url}")
            txt_lines.append(f"Time: {r.timestamp.isoformat()}")
            txt_lines.append(f"Mobiles: {', '.join(r.mobiles)}")
            txt_lines.append(f"Landlines: {', '.join(r.landlines)}")
            txt_lines.append(f"Emails: {', '.join(r.emails)}")
            txt_lines.append(f"Instagram: {', '.join(r.instagram)}")
            txt_lines.append(f"YouTube: {', '.join(r.youtube)}")
            txt_lines.append("-"*50)
        zf.writestr("history.txt", "\n".join(txt_lines))

    zip_buffer.seek(0)
    return StreamingResponse(zip_buffer, media_type="application/zip",
                             headers={"Content-Disposition": "attachment; filename=history_export.zip"})

# --------------------- مسیرهای دارای {id} ---------------------
@app.get("/history/{id}")
async def history_item(id: int, request: Request):
    user = await get_current_user_required(request)
    db = DatabaseManager()
    rec = db.get_history_by_id(id, user.id)
    db.close()
    if not rec:
        raise HTTPException(404, "Not found")
    return {
        "id": rec.id,
        "url": rec.url,
        "timestamp": rec.timestamp.isoformat(),
        "deleted_at": rec.deleted_at.isoformat() if rec.deleted_at else None,
        "mobiles": rec.mobiles,
        "landlines": rec.landlines,
        "emails": rec.emails,
        "links": rec.links,
        "instagram": rec.instagram,
        "youtube": rec.youtube
    }

@app.delete("/history/{id}")
async def delete_history_item(id: int, request: Request, permanent: bool = False):
    user = await get_current_user_required(request)
    db = DatabaseManager()
    if db.delete_history(id, user.id, permanent):
        db.close()
        return {"message": "Deleted"}
    db.close()
    raise HTTPException(404, "Not found")

@app.post("/history/{id}/restore")
async def restore_history_item(id: int, request: Request):
    user = await get_current_user_required(request)
    db = DatabaseManager()
    if db.restore_history(id, user.id):
        db.close()
        return {"message": "Restored"}
    db.close()
    raise HTTPException(404, "Not found")

# --------------------- سایر مسیرها ---------------------
@app.get("/dashboard/stats")
async def get_dashboard_stats(request: Request):
    user = await get_current_user_required(request)
    db = DatabaseManager()
    total_scrapes = db.get_history_count(user.id)
    records = db.get_user_history(user.id, limit=1000)
    total_mobiles = sum(len(r.mobiles) for r in records)
    total_emails = sum(len(r.emails) for r in records)
    total_instagram = sum(len(r.instagram) for r in records)
    total_youtube = sum(len(r.youtube) for r in records)
    chart_data = []
    for r in records[:30]:
        chart_data.append({
            "date": r.timestamp.strftime("%Y-%m-%d"),
            "mobiles": len(r.mobiles),
            "emails": len(r.emails)
        })
    db.close()
    return {
        "total_scrapes": total_scrapes,
        "total_mobiles": total_mobiles,
        "total_emails": total_emails,
        "total_instagram": total_instagram,
        "total_youtube": total_youtube,
        "chart_data": chart_data
    }

@app.get("/ping")
async def ping():
    return {"status": "ok", "timestamp": datetime.now().isoformat()}

# ========== اجرا ==========
if __name__ == "__main__":
    port = int(os.getenv("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)