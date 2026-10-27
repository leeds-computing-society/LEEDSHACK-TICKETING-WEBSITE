from sqlalchemy.orm import Session

from models import Participant
from schemas import ParticipantCreate


def create_participant(
    db: Session,
    participant: ParticipantCreate
):

    new_participant = Participant(

        # Personal information
        first_name=participant.first_name,
        last_name=participant.last_name,
        preferred_name=participant.preferred_name,
        pronouns=participant.pronouns,
        date_of_birth=participant.date_of_birth,
        phone_number=participant.phone_number,

        # Location
        country_of_residence=participant.country_of_residence,
        other_country=participant.other_country,

        # Education
        university_email=str(participant.university_email),
        university=participant.university,
        level_of_study=participant.level_of_study,
        undergraduate_year=participant.undergraduate_year,
        graduation_year=participant.graduation_year,
        course=participant.course,
        hackathons_attended=participant.hackathons_attended,

        # Diversity
        gender=participant.gender,
        ethnicity=participant.ethnicity,

        # Dietary
        vegetarian=int(participant.vegetarian),
        vegan=int(participant.vegan),
        halal=int(participant.halal),
        kosher=int(participant.kosher),
        gluten_free=int(participant.gluten_free),
        no_beef=int(participant.no_beef),
        lactose_intolerant=int(participant.lactose_intolerant),
        dietary_other=int(participant.dietary_other),
        dietary_other_description=(
            participant.dietary_other_description
        ),

        # Event
        tshirt_size=participant.tshirt_size,
        accessibility_requirements=(
            participant.accessibility_requirements
        ),

        # Social
        github_username=participant.github_username,
        linkedin_url=participant.linkedin_url,

        # Team
        linked_team_members=participant.linked_team_members,

        # Consent
        mlh_code_of_conduct=int(
            participant.mlh_code_of_conduct
        ),
        mlh_terms=int(
            participant.mlh_terms
        ),
        luu_privacy=int(
            participant.luu_privacy
        ),
        photography_consent=int(
            participant.photography_consent
        ),
        mlh_emails=int(
            participant.mlh_emails
        ),
        sponsor_emails=int(
            participant.sponsor_emails
        ),

        # Administration
        status="Pending"
    )

    db.add(new_participant)
    db.commit()
    db.refresh(new_participant)

    return new_participant