from sqlalchemy import Column, Integer, String, JSON, ForeignKey
from sqlalchemy.orm import relationship
from .database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    skills = Column(JSON, default=[])
    experience = Column(String, nullable=True)
    education = Column(String, nullable=True)

    bookmarks = relationship("Bookmark", back_populates="owner")

class Bookmark(Base):
    __tablename__ = "bookmarks"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    internship_id = Column(Integer)  # References ID in internships.json
    
    owner = relationship("User", back_populates="bookmarks")
