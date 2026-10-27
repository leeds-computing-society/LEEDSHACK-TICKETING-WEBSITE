from pydantic import BaseModel, EmailStr
from typing import Optional


class ParticipantCreate(BaseModel):

    # =========================
    # Personal information
    # =========================

    first_name: str
    last_name: str
    preferred_name: Optional[str] = None
    pronouns: Optional[str] = None
    date_of_birth: str
    phone_number: str

    # =========================
    # Location
    # =========================

    country_of_residence: str
    other_country: Optional[str] = None

    # =========================
    # Education
    # =========================

    university_email: EmailStr
    university: str
    level_of_study: str
    undergraduate_year: Optional[str] = None
    graduation_year: str
    course: str
    hackathons_attended: str

    # =========================
    # Diversity
    # =========================

    gender: Optional[str] = None
    ethnicity: Optional[str] = None

    # =========================
    # Dietary
    # =========================

    vegetarian: bool = False
    vegan: bool = False
    halal: bool = False
    kosher: bool = False
    gluten_free: bool = False
    no_beef: bool = False
    lactose_intolerant: bool = False
    dietary_other: bool = False
    dietary_other_description: Optional[str] = None

    # =========================
    # Event
    # =========================

    tshirt_size: str
    accessibility_requirements: Optional[str] = None

    # =========================
    # Social
    # =========================

    github_username: Optional[str] = None
    linkedin_url: Optional[str] = None

    # =========================
    # Team
    # =========================

    linked_team_members: Optional[str] = None

    # =========================
    # Consent
    # =========================

    mlh_code_of_conduct: bool
    mlh_terms: bool
    luu_privacy: bool
    photography_consent: bool

    mlh_emails: bool = False
    sponsor_emails: bool = False


class ParticipantResponse(BaseModel):

    id: int
    first_name: str
    last_name: str
    university_email: EmailStr
    status: str

    class Config:
        from_attributes = True

class TeamCreate(BaseModel):
    email1: EmailStr  #person creating team
    email2: EmailStr
    email3: Optional[EmailStr] = None
    email4: Optional[EmailStr] = None