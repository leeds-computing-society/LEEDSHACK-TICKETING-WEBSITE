from database import Base, engine
from models import Participant


Base.metadata.create_all(bind=engine)

print("Database created successfully!")