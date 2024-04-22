import utils.env_utils
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

engine = create_engine(utils.env_utils.env.SQLALCHEMY_DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
