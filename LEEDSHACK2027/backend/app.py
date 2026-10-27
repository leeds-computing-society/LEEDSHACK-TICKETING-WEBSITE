from fastapi import FastAPI, Depends, HTTPException

from fastapi.middleware.cors import CORSMiddleware

from sqlalchemy.orm import Session

from sqlalchemy.exc import IntegrityError

from database import Base, engine, get_db

from models import Participant

from schemas import ParticipantCreate, ParticipantResponse, TeamCreate

import json

import random

import os

import smtplib

from email.mime.text import MIMEText

from email.mime.multipart import MIMEMultipart

from pydantic import BaseModel

from dotenv import load_dotenv

import io

import csv

from fastapi.responses import StreamingResponse

load_dotenv()

# Create FastAPI application

app = FastAPI(
    title="LeedsHack 2027 API",
    description="Backend API for LeedsHack 2027",
    version="1.0.0"
)

# Create database tables if they don't already exist

Base.metadata.create_all(bind=engine)

# Normalise status values from older database versions. Status comparisons
# throughout the application use these exact values and capitalisation.
with engine.begin() as connection:
    status_migrations = {
        "pending": "Pending",
        "picked": "Picked",
        "notpicked": "notPicked",
        "not_picked": "notPicked",
        "confirmed": "Confirmed",
        "cancelled": "Cancelled",
        "reallocated": "Reallocated",
    }
    for old_status, canonical_status in status_migrations.items():
        connection.execute(
            Participant.__table__.update()
            .where(Participant.__table__.c.status == old_status)
            .values(status=canonical_status)
        )
# Allow React frontend to communicate with FastAPI

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

# ============================================================

# HOME

# ============================================================

@app.get("/")

def root():
    return {
        "message": "LeedsHack 2026 API is running"
    }
# ============================================================

# REGISTRATION

# ============================================================

@app.post(
    "/api/register",
    response_model=ParticipantResponse
)

def register(
    participant: ParticipantCreate,
    db: Session = Depends(get_db)
):
    new_participant = Participant(
        # Personal
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
        lactose_intolerant=int(
            participant.lactose_intolerant
        ),
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
        linked_team_members=(
            participant.linked_team_members
        ),
        # Consent
        mlh_code_of_conduct=int(
            participant.mlh_code_of_conduct
        ),
        mlh_terms=int(participant.mlh_terms),
        luu_privacy=int(participant.luu_privacy),
        photography_consent=int(
            participant.photography_consent
        ),
        mlh_emails=int(participant.mlh_emails),
        sponsor_emails=int(participant.sponsor_emails),
        # Administration
        status="Pending"
    )
    try:
        db.add(new_participant)
        db.commit()
        db.refresh(new_participant)
        return new_participant
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=409,
            detail="This university email is already registered."
        )
# ============================================================

# GET ALL PARTICIPANTS

# ============================================================

@app.get("/api/admin/participants")

def get_participants(
    db: Session = Depends(get_db)
):
    participants = (
        db.query(Participant)
        .order_by(Participant.created_at.desc())
        .all()
    )
    return participants
# ============================================================

# GET ONE PARTICIPANT

# ============================================================

@app.get("/api/admin/participants/{participant_id}")

def get_participant(
    participant_id: int,
    db: Session = Depends(get_db)
):
    participant = (
        db.query(Participant)
        .filter(
            Participant.id == participant_id
        )
        .first()
    )
    if participant is None:
        raise HTTPException(
            status_code=404,
            detail="Participant not found."
        )
    return participant
# ============================================================

# UPDATE PARTICIPANT STATUS

# ============================================================

@app.put(
    "/api/admin/participants/{participant_id}/status"
)

def update_status(
    participant_id: int,
    status: str,
    db: Session = Depends(get_db)
):
    allowed_statuses = [
        "Pending",
        "Picked",
        "notPicked",
        "Reallocated",
        "Confirmed",
        "Cancelled"
    ]
    if status not in allowed_statuses:
        raise HTTPException(
            status_code=400,
            detail=(
                "Status must be Pending, Picked, notPicked, "
                "Reallocated, Confirmed or Cancelled."
            )
        )
    participant = (
        db.query(Participant)
        .filter(
            Participant.id == participant_id
        )
        .first()
    )
    if participant is None:
        raise HTTPException(
            status_code=404,
            detail="Participant not found."
        )
    participant.status = status
    db.commit()
    db.refresh(participant)
    return {
        "message": "Status updated successfully",
        "status": participant.status
    }
# ============================================================

# UPDATE TEAM

# ============================================================

@app.put("/api/teams/{participant_id}")

def update_team(
    participant_id: int,
    linked_team_members: str,
    db: Session = Depends(get_db)
):
    participant = (
        db.query(Participant)
        .filter(
            Participant.id == participant_id
        )
        .first()
    )
    if participant is None:
        raise HTTPException(
            status_code=404,
            detail="Participant not found."
        )
    participant.linked_team_members = (
        linked_team_members
    )
    db.commit()
    db.refresh(participant)
    return {
        "message": "Team updated successfully"
    }
# ============================================================

# DELETE PARTICIPANT

# ============================================================

@app.delete(
    "/api/admin/participants/{participant_id}"
)

def delete_participant(
    participant_id: int,
    db: Session = Depends(get_db)
):
    participant = (
        db.query(Participant)
        .filter(
            Participant.id == participant_id
        )
        .first()
    )
    if participant is None:
        raise HTTPException(
            status_code=404,
            detail="Participant not found."
        )
    db.delete(participant)
    db.commit()
    return {
        "message": "Participant deleted successfully"
    }
# ============================================================

# TEAM SIGNUP

# ============================================================

@app.post("/api/team-register")

def register_team(
    team: TeamCreate,
    db: Session = Depends(get_db)
):
    # Collect all supplied emails
    emails = [
        str(team.email1).strip().lower(),
        str(team.email2).strip().lower()
    ]
    if team.email3:
        emails.append(
            str(team.email3).strip().lower()
        )
    if team.email4:
        emails.append(
            str(team.email4).strip().lower()
        )
    # Check for duplicate emails
    if len(emails) != len(set(emails)):
        raise HTTPException(
            status_code=400,
            detail="The same email cannot appear more than once in a team."
        )
    # Check that all participants are registered
    participants = (
        db.query(Participant)
        .filter(
            Participant.university_email.in_(emails)
        )
        .all()
    )
    found_emails = {
        participant.university_email.lower()
        for participant in participants
    }
    missing_emails = [
        email
        for email in emails
        if email not in found_emails
    ]
    if missing_emails:
        raise HTTPException(
            status_code=404,
            detail=(
                "The following email(s) have not registered: "
                + ", ".join(missing_emails)
            )
        )
    # Check whether any participant is already
    # linked to another team
    already_in_team = []
    for participant in participants:
        if participant.linked_team_members:
            existing_team = json.loads(
                participant.linked_team_members
            )
            if existing_team:
                already_in_team.append(
                    participant.university_email
                )
    if already_in_team:
        raise HTTPException(
            status_code=409,
            detail=(
                "The following participant(s) "
                "are already part of a team: "
                + ", ".join(already_in_team)
            )
        )
    # Update EVERY participant's linked_team_members
    for participant in participants:
        participant_email = (
            participant.university_email.lower()
        )
        # Everyone except themselves
        other_members = [
            email
            for email in emails
            if email != participant_email
        ]
        # Store as JSON text in SQLite
        participant.linked_team_members = json.dumps(
            other_members
        )
    db.commit()
    return {
        "message": "Team created successfully!",
        "team_members": emails
    }
@app.post("/api/admin/assign-teams")

def assign_teams(
    db: Session = Depends(get_db)
):
    # =========================================================
    # GET ALL REGISTERED PARTICIPANTS
    # =========================================================
    participants = (
        db.query(Participant)
        .all()
    )
    if not participants:
        raise HTTPException(
            status_code=400,
            detail="There are no registered participants."
        )
    # =========================================================
    # CREATE EMAIL -> PARTICIPANT LOOKUP
    # =========================================================
    participant_by_email = {
        participant.university_email.strip().lower(): participant
        for participant in participants
    }
    # =========================================================
    # FIND EXISTING LINKED TEAMS
    # =========================================================
    existing_groups = []
    assigned_emails = set()
    for participant in participants:
        email = (
            participant.university_email
            .strip()
            .lower()
        )
        # This person has already been included
        # in an existing team
        if email in assigned_emails:
            continue
        # -----------------------------------------------------
        # Read their linked team members
        # -----------------------------------------------------
        linked_members = []
        if participant.linked_team_members:
            try:
                linked_members = json.loads(
                    participant.linked_team_members
                )
            except (
                json.JSONDecodeError,
                TypeError
            ):
                raise HTTPException(
                    status_code=400,
                    detail=(
                        "Invalid team data exists "
                        "in the database."
                    )
                )
        # No existing team
        if not linked_members:
            continue
        # =====================================================
        # BUILD COMPLETE CONNECTED TEAM
        # =====================================================
        group_emails = set()
        group_emails.add(email)
        # Add directly linked members
        for linked_email in linked_members:
            linked_email = (
                linked_email
                .strip()
                .lower()
            )
            # Make sure linked person exists
            if linked_email not in participant_by_email:
                raise HTTPException(
                    status_code=400,
                    detail=(
                        "An existing team contains "
                        "a participant who is not "
                        "registered."
                    )
                )
            group_emails.add(
                linked_email
            )
        # -----------------------------------------------------
        # Also inspect the linked members' own lists.
        #
        # This means :
        #
        # Alice -> Bob
        # Bob -> Alice, Charlie
        #
        # the system correctly treats them as:
        #
        # Alice + Bob + Charlie
        # -----------------------------------------------------
        members_to_check = list(
            group_emails
        )
        checked_members = set()
        while members_to_check:
            current_email = (
                members_to_check.pop()
            )
            if current_email in checked_members:
                continue
            checked_members.add(
                current_email
            )
            current_participant = (
                participant_by_email[
                    current_email
                ]
            )
            if not current_participant.linked_team_members:
                continue
            try:
                current_links = json.loads(
                    current_participant.linked_team_members
                )
            except (
                json.JSONDecodeError,
                TypeError
            ):
                raise HTTPException(
                    status_code=400,
                    detail=(
                        "Invalid team data exists "
                        "in the database."
                    )
                )
            for member_email in current_links:
                member_email = (
                    member_email
                    .strip()
                    .lower()
                )
                if member_email not in participant_by_email:
                    raise HTTPException(
                        status_code=400,
                        detail=(
                            "An existing team contains "
                            "a participant who is not "
                            "registered."
                        )
                    )
                if member_email not in group_emails:
                    group_emails.add(
                        member_email
                    )
                    members_to_check.append(
                        member_email
                    )
        # =====================================================
        # EXISTING TEAM CANNOT BE LARGER THAN 4
        # =====================================================
        if len(group_emails) > 4:
            raise HTTPException(
                status_code=400,
                detail=(
                    "An existing linked team contains "
                    "more than 4 participants."
                )
            )
        # Convert set to list
        group = list(group_emails)
        existing_groups.append(
            group
        )
        # Mark everyone as already assigned
        assigned_emails.update(
            group_emails
        )
    # =========================================================
    # FIND PEOPLE WITHOUT EXISTING TEAMS
    # =========================================================
    unassigned = [
        email
        for email in participant_by_email
        if email not in assigned_emails
    ]
    # Randomise people without teams
    random.shuffle(
        unassigned
    )
    # =========================================================
    # SEPARATE EXISTING GROUPS BY SIZE
    # =========================================================
    full_groups = []
    groups_of_three = []
    groups_of_two = []
    for group in existing_groups:
        if len(group) == 4:
            full_groups.append(
                group
            )
        elif len(group) == 3:
            groups_of_three.append(
                group
            )
        elif len(group) == 2:
            groups_of_two.append(
                group
            )
        else:
            raise HTTPException(
                status_code=400,
                detail=(
                    "An invalid existing team "
                    "was found."
                )
            )
    # =========================================================
    # FINAL TEAM LIST
    # =========================================================
    completed_groups = []
    # =========================================================
    # EXISTING TEAMS OF 4
    #
    # These stay exactly as they are.
    # =========================================================
    completed_groups.extend(
        full_groups
    )
    # =========================================================
    # COMBINE EXISTING TEAMS OF 2
    #
    # Two teams of 2 become one team of 4.
    # =========================================================
    while len(groups_of_two) >= 2:
        team_a = (
            groups_of_two.pop()
        )
        team_b = (
            groups_of_two.pop()
        )
        combined_team = (
            team_a + team_b
        )
        completed_groups.append(
            combined_team
        )
    # =========================================================
    # FILL EXISTING TEAMS OF 3
    #
    # Each gets one random unassigned participant.
    # =========================================================
    for group in groups_of_three:
        if unassigned:
            new_member = (
                unassigned.pop()
            )
            group.append(
                new_member
            )
        completed_groups.append(
            group
        )
    # =========================================================
    # FILL REMAINING EXISTING TEAMS OF 2
    #
    # These are teams of 2 that couldn't be paired with
    # another existing team of 2.
    #
    # Add up to 2 random unassigned participants.
    # =========================================================
    for group in groups_of_two:
        while (
            len(group) < 4
            and unassigned
        ):
            new_member = (
                unassigned.pop()
            )
            group.append(
                new_member
            )
        completed_groups.append(
            group
        )
    # =========================================================
    # CREATE BRAND NEW TEAMS OF 4
    # =========================================================
    while len(unassigned) >= 4:
        new_group = [
            unassigned.pop()
            for _ in range(4)
        ]
        completed_groups.append(
            new_group
        )
    # =========================================================
    # FINAL LEFTOVER GROUP
    #
    # If 2 or 3 people remain, put them together.
    # =========================================================
    if unassigned:
        final_group = list(
            unassigned
        )
        completed_groups.append(
            final_group
        )
    # =========================================================
    # SAFETY CHECK
    #
    # Make absolutely sure nobody has been assigned twice.
    # =========================================================
    all_assigned = []
    for group in completed_groups:
        all_assigned.extend(
            group
        )
    if len(all_assigned) != len(
        set(all_assigned)
    ):
        raise HTTPException(
            status_code=500,
            detail=(
                "Team assignment error: "
                "a participant was assigned "
                "to more than one team."
            )
        )
    # =========================================================
    # SAFETY CHECK
    #
    # Make sure EVERY participant is assigned.
    # =========================================================
    if set(all_assigned) != set(
        participant_by_email.keys()
    ):
        raise HTTPException(
            status_code=500,
            detail=(
                "Team assignment error: "
                "not all participants were assigned."
            )
        )
    # =========================================================
    # UPDATE DATABASE
    #
    # Each participant gets the OTHER members of their team.
    # =========================================================
    for group in completed_groups:
        for email in group:
            participant = (
                participant_by_email[email]
            )
            other_members = [
                member_email
                for member_email in group
                if member_email != email
            ]
            participant.linked_team_members = (
                json.dumps(
                    other_members
                )
            )
    # =========================================================
    # SAVE EVERYTHING
    # =========================================================
    db.commit()
    # =========================================================
    # RETURN RESULT TO ADMIN FRONTEND
    # =========================================================
    return {
        "message": "Teams assigned successfully.",
        "number_of_teams": len(
            completed_groups
        ),
        "teams": completed_groups
    }
@app.get("/api/admin/participants")

def get_participants(db: Session = Depends(get_db)):
    participants = (
        db.query(Participant)
        .order_by(Participant.id)
        .all()
    )
    result = []
    for participant in participants:
        # Convert database JSON string into a Python list
        if participant.linked_team_members:
            try:
                team_members = json.loads(
                    participant.linked_team_members
                )
            except (json.JSONDecodeError, TypeError):
                team_members = []
        else:
            team_members = []
        result.append({
            "id": participant.id,
            "first_name": participant.first_name,
            "last_name": participant.last_name,
            "preferred_name": participant.preferred_name,
            "university_email": participant.university_email,
            "university": participant.university,
            "status": participant.status,
            "linked_team_members": team_members
        })
    return result
@app.delete("/api/admin/delete-database")

def delete_database(db: Session = Depends(get_db)):
    try:
        print("===== DELETE DATABASE =====")
        # Count participants before deletion
        before_count = db.query(Participant).count()
        print("BEFORE DELETE:", before_count)
        # Delete every participant
        deleted_count = (
            db.query(Participant).delete(
                synchronize_session=False
            )
        )
        db.commit()
        # Count again after commit
        after_count = db.query(Participant).count()
        print("DELETED:", deleted_count)
        print("AFTER DELETE:", after_count)
        return {
            "message": "Database cleared successfully.",
            "deleted_count": deleted_count,
            "before_count": before_count,
            "after_count": after_count
        }
    except Exception as error:
        db.rollback()
        print("DELETE ERROR:", error)
        raise HTTPException(
            status_code=500,
            detail=f"Failed to delete database: {str(error)}"
        )
@app.post("/api/admin/random-pick")

def randomly_pick_teams(db: Session = Depends(get_db)):
    MAX_PEOPLE = 200
    try:
        # Get everyone currently pending
        participants = (
            db.query(Participant)
            .filter(Participant.status == "Pending")
            .all()
        )
        if not participants:
            raise HTTPException(
                status_code=400,
                detail="There are no pending participants to select."
            )
        # ---------------------------------------------------------
        # BUILD TEAMS
        # ---------------------------------------------------------
        # Dictionary allowing us to find participants by email
        participant_by_email = {
            participant.university_email: participant
            for participant in participants
        }
        teams = []
        processed_emails = set()
        for participant in participants:
            email = participant.university_email
            if email in processed_emails:
                continue
            # Start this team with the current participant
            team = [participant]
            team_emails = {email}
            # linked_team_members is stored as JSON text
            if participant.linked_team_members:
                try:
                    linked_members = json.loads(
                        participant.linked_team_members
                    )
                except (json.JSONDecodeError, TypeError):
                    linked_members = []
                for member_email in linked_members:
                    if member_email in participant_by_email:
                        member = participant_by_email[member_email]
                        if member_email not in team_emails:
                            team.append(member)
                            team_emails.add(member_email)
            teams.append(team)
            processed_emails.update(team_emails)
        # ---------------------------------------------------------
        # RANDOMISE TEAM ORDER
        # ---------------------------------------------------------
        random.shuffle(teams)
        # ---------------------------------------------------------
        # SELECT WHOLE TEAMS
        # ---------------------------------------------------------
        selected_teams = []
        selected_people = 0
        for team in teams:
            team_size = len(team)
            # Don't go above 200 people
            if selected_people + team_size <= MAX_PEOPLE:
                selected_teams.append(team)
                selected_people += team_size
        # ---------------------------------------------------------
        # UPDATE STATUSES
        # ---------------------------------------------------------
        selected_emails = set()
        for team in selected_teams:
            for participant in team:
                participant.status = "Picked"
                selected_emails.add(
                    participant.university_email
                )
        # Everyone else who was pending becomes notPicked
        for participant in participants:
            if participant.university_email not in selected_emails:
                participant.status = "notPicked"
        # Save everything
        db.commit()
        return {
            "message": "Random team selection completed.",
            "people_picked": selected_people,
            "teams_picked": len(selected_teams),
            "people_not_picked": len(participants) - selected_people
        }
    except HTTPException:
        raise
    except Exception as error:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail=f"Random team selection failed: {str(error)}"
        )
def load_email_template(filename):
    email_path = os.path.join(
        os.path.dirname(__file__),
        "emails",
        filename
    )
    with open(email_path, "r", encoding="utf-8") as file:
        return file.read()
def send_email(
    recipient,
    subject,
    message
):
    sender = os.getenv("EMAIL_ADDRESS")
    password = os.getenv("EMAIL_PASSWORD")
    if not sender or not password:
        raise Exception(
            "Email configuration is missing."
        )
    email = MIMEMultipart()
    email["From"] = sender
    email["To"] = recipient
    email["Subject"] = subject
    email.attach(
        MIMEText(
            message,
            "plain",
            "utf-8"
        )
    )
    with smtplib.SMTP(
        "smtp.gmail.com",
        587
    ) as server:
        server.starttls()
        server.login(
            sender,
            password
        )
        server.send_message(email)
CONFIRMATION_PAGE_URL = os.getenv(
    "CONFIRMATION_PAGE_URL",
    "http://localhost:5173/confirmation"
)

EMAIL_DRY_RUN = (
    os.getenv("EMAIL_DRY_RUN", "true").lower() == "true"
)

def process_participant_email(
    participant,
    template_filename,
    default_subject
):
    """Prepare an email and either print it or send it."""
    template = load_email_template(template_filename)
    preferred_name = (
        participant.preferred_name or participant.first_name
    )
    message = template.format(
        first_name=participant.first_name,
        last_name=participant.last_name,
        preferred_name=preferred_name,
        university_email=participant.university_email,
        university=participant.university,
        confirmation_url=CONFIRMATION_PAGE_URL
    )
    lines = message.splitlines()
    if lines and lines[0].startswith("Subject:"):
        subject = lines[0][len("Subject:"):].strip()
        body = "\n".join(lines[1:]).strip()
    else:
        subject = default_subject
        body = message.strip()
    if not subject:
        raise ValueError(
            f"Email template '{template_filename}' has no subject."
        )
    if EMAIL_DRY_RUN:
        print("\n========== EMAIL DRY RUN ==========")
        print("To:", participant.university_email)
        print("Subject:", subject)
        print("Body:\n", body)
        print("===================================\n")
    else:
        send_email(
            participant.university_email,
            subject,
            body
        )
@app.post("/api/admin/send-emails")

def send_participant_emails(
    db: Session = Depends(get_db)
):
    try:
        picked_participants = (
            db.query(Participant)
            .filter(Participant.status == "Picked")
            .all()
        )
        not_picked_participants = (
            db.query(Participant)
            .filter(Participant.status == "notPicked")
            .all()
        )
        picked_count = 0
        not_picked_count = 0
        failed = 0
        for participant in picked_participants:
            try:
                process_participant_email(
                    participant,
                    "picked.txt",
                    "LeedsHack 2027 - Application Update"
                )
                picked_count += 1
            except Exception as error:
                failed += 1
                print(
                    f"Failed picked email for "
                    f"{participant.university_email}: {error}"
                )
        for participant in not_picked_participants:
            try:
                process_participant_email(
                    participant,
                    "not_picked.txt",
                    "LeedsHack 2027 - Application Update"
                )
                not_picked_count += 1
            except Exception as error:
                failed += 1
                print(
                    f"Failed unsuccessful-applicant email for "
                    f"{participant.university_email}: {error}"
                )
        return {
            "message": "Initial application email workflow completed.",
            "picked_emails": picked_count,
            "not_picked_emails": not_picked_count,
            "failed": failed,
            "dry_run": EMAIL_DRY_RUN
        }
    except Exception as error:
        print("Initial email workflow error:", repr(error))
        raise HTTPException(
            status_code=500,
            detail="Failed to process initial application emails."
        )
@app.post("/api/admin/send-confirmation-invitations")

def send_confirmation_invitations(
    db: Session = Depends(get_db)
):
    participants = (
        db.query(Participant)
        .filter(Participant.status == "Picked")
        .all()
    )
    sent = 0
    failed = 0
    for participant in participants:
        try:
            process_participant_email(
                participant,
                "confirmation_invitation.txt",
                "LeedsHack 2027 - Confirm Your Place"
            )
            sent += 1
        except Exception as error:
            failed += 1
            print(
                f"Confirmation invitation failed for "
                f"{participant.university_email}: {error}"
            )
    return {
        "message": "Confirmation invitation workflow completed.",
        "emails_sent": sent,
        "failed": failed,
        "dry_run": EMAIL_DRY_RUN
    }
@app.post("/api/admin/send-reallocation-emails")

def send_reallocation_emails(
    db: Session = Depends(get_db)
):
    participants = (
        db.query(Participant)
        .filter(Participant.status == "Reallocated")
        .all()
    )
    sent = 0
    failed = 0
    for participant in participants:
        try:
            process_participant_email(
                participant,
                "reallocated.txt",
                "LeedsHack 2027 - You've Been Offered a Place!"
            )
            sent += 1
        except Exception as error:
            failed += 1
            print(
                f"Reallocation email failed for "
                f"{participant.university_email}: {error}"
            )
    return {
        "message": "Reallocation email workflow completed.",
        "emails_sent": sent,
        "failed": failed,
        "dry_run": EMAIL_DRY_RUN
    }
class AttendanceConfirmation(BaseModel):
    university_email: str
    can_attend: bool
@app.post("/api/confirm-attendance")

def confirm_attendance(
    data: AttendanceConfirmation,
    db: Session = Depends(get_db)
):
    participant = (
        db.query(Participant)
        .filter(
            Participant.university_email == data.university_email
        )
        .first()
    )
    if not participant:
        raise HTTPException(
            status_code=404,
            detail="No registered participant was found with that email address."
        )
    # They must have been picked before they can confirm.
    if participant.status not in ("Picked", "Reallocated"):
        if participant.status == "Confirmed":
            raise HTTPException(
                status_code=400,
                detail="You have already confirmed your attendance."
            )
        if participant.status == "Cancelled":
            raise HTTPException(
                status_code=400,
                detail="Your registration has already been cancelled."
            )
        if participant.status == "notPicked":
            raise HTTPException(
                status_code=400,
                detail="You have not been allocated a ticket."
            )
        if participant.status == "Pending":
            raise HTTPException(
                status_code=400,
                detail="Your application has not yet been processed."
            )
        raise HTTPException(
            status_code=400,
            detail="You are not currently eligible to confirm attendance."
        )
    # Update their attendance status.
    if data.can_attend:
        participant.status = "Confirmed"
    else:
        participant.status = "Cancelled"
    # Save the status before attempting to send the email.
    db.commit()
    db.refresh(participant)
    # Automatically email participants who confirm that they can attend.
    if data.can_attend:
        try:
            process_participant_email(
                participant,
                "confirmation_received.txt",
                "LeedsHack 2027 - Your Place Is Confirmed!"
            )
        except Exception as error:
            # The confirmation remains saved if sending fails.
            print(
                f"Failed to send confirmation acknowledgement to "
                f"{participant.university_email}: {error}"
            )
    return {
        "message": (
            "Your attendance has been confirmed successfully."
            if data.can_attend
            else "Your attendance status has been updated."
        ),
        "status": participant.status
    }
# ============================================================

# ADMIN - CONFIRMED PARTICIPANTS

# ============================================================

@app.get("/api/admin/confirmed")

def get_confirmed_participants(
    db: Session = Depends(get_db)
):
    participants = (
        db.query(Participant)
        .filter(
            Participant.status == "Confirmed"
        )
        .order_by(
            Participant.last_name.asc()
        )
        .all()
    )
    return [
        {
            "id": participant.id,
            "first_name": participant.first_name,
            "last_name": participant.last_name,
            "preferred_name": participant.preferred_name,
            "university_email": participant.university_email,
            "gender": participant.gender,
            "ethnicity": participant.ethnicity,
            "status": participant.status,
        }
        for participant in participants
    ]
# ============================================================

# ADMIN - NOT PICKED / REALLOCATION

# ============================================================

@app.get("/api/admin/reallocation")

def get_reallocation_participants(
    db: Session = Depends(get_db)
):
    participants = (
        db.query(Participant)
        .filter(
            Participant.status == "notPicked"
        )
        .order_by(
            Participant.last_name.asc()
        )
        .all()
    )
    return [
        {
            "id": participant.id,
            "first_name": participant.first_name,
            "last_name": participant.last_name,
            "preferred_name": participant.preferred_name,
            "university_email": participant.university_email,
            "gender": participant.gender,
            "ethnicity": participant.ethnicity,
            "status": participant.status,
        }
        for participant in participants
    ]
# ============================================================

# ADMIN - RANDOM FAIR REALLOCATION

# ============================================================

@app.post("/api/admin/reallocate-random")

def randomly_reallocate_tickets(
    db: Session = Depends(get_db)
):
    MAX_PEOPLE = 200
    try:
        # ========================================================
        # 1. FIND CURRENT TICKET USAGE
        # ========================================================
        confirmed_count = (
            db.query(Participant)
            .filter(
                Participant.status == "Confirmed"
            )
            .count()
        )
        picked_count = (
            db.query(Participant)
            .filter(Participant.status.in_(["Picked", "Reallocated"]))
            .count()
        )
        # These are genuinely available tickets.
        #
        # Someone who is currently "Picked" still has a ticket
        # reserved for them, so they must not be replaced yet.
        available_tickets = (
            MAX_PEOPLE
            - confirmed_count
            - picked_count
        )
        if available_tickets <= 0:
            raise HTTPException(
                status_code=400,
                detail=(
                    "There are currently no spare tickets "
                    "available for reallocation."
                )
            )
        # ========================================================
        # 2. GET ALL PEOPLE WHO WERE NOT PICKED
        # ========================================================
        candidates = (
            db.query(Participant)
            .filter(
                Participant.status == "notPicked"
            )
            .all()
        )
        if not candidates:
            raise HTTPException(
                status_code=400,
                detail=(
                    "There are no eligible participants "
                    "available for reallocation."
                )
            )
        # We cannot allocate more tickets than there are candidates.
        tickets_to_allocate = min(
            available_tickets,
            len(candidates)
        )
        # ========================================================
        # 3. NORMALISE GENDER VALUES
        # ========================================================
        def get_gender_category(participant):
            """
            Convert the participant's gender response into
            one of three balancing categories:
                man
                woman
                other
            Anything that isn't clearly Man or Woman is treated
            as Other.
            This means Other can include:
            - Non-binary
            - Prefer not to say
            - Another identity
            - Missing/unspecified values
            """
            if not participant.gender:
                return "other"
            gender = participant.gender.strip().lower()
            man_values = {
                "man",
                "male",
                "m"
            }
            woman_values = {
                "woman",
                "female",
                "f"
            }
            if gender in man_values:
                return "man"
            if gender in woman_values:
                return "woman"
            return "other"
        # ========================================================
        # 4. CURRENT SELECTED GENDER DISTRIBUTION
        # ========================================================
        currently_selected = (
            db.query(Participant)
            .filter(
                Participant.status.in_([
                    "Picked",
                    "Reallocated",
                    "Confirmed"
                ])
            )
            .all()
        )
        selected_counts = {
            "man": 0,
            "woman": 0,
            "other": 0
        }
        for participant in currently_selected:
            category = get_gender_category(participant)
            selected_counts[category] += 1
        # ========================================================
        # 5. TARGET DISTRIBUTION
        # ========================================================
        #
        # We aim approximately for:
        #
        #     Man    = 45%
        #     Woman  = 45%
        #     Other  = 10%
        #
        # This is NOT a hard quota.
        #
        # It simply gives underrepresented groups a higher
        # probability during random selection.
        #
        # Other is intentionally not forced to equal Man/Woman.
        # ========================================================
        target_proportions = {
            "man": 0.45,
            "woman": 0.45,
            "other": 0.10
        }
        # ========================================================
        # 6. RANDOM WEIGHTED SELECTION
        # ========================================================
        selected = []
        remaining_candidates = candidates.copy()
        for _ in range(tickets_to_allocate):
            if not remaining_candidates:
                break
            # Number of people that will exist after this ticket
            # is allocated.
            projected_total = (
                len(currently_selected)
                + len(selected)
                + 1
            )
            weights = []
            for candidate in remaining_candidates:
                category = get_gender_category(candidate)
                # Current number in this category
                current_category_count = (
                    selected_counts[category]
                    + sum(
                        1
                        for person in selected
                        if get_gender_category(person) == category
                    )
                )
                # Expected number according to our target.
                target_count = (
                    projected_total
                    * target_proportions[category]
                )
                # How far below target is this category?
                deficit = (
                    target_count
                    - current_category_count
                )
                # ------------------------------------------------
                # BASE RANDOM WEIGHT
                # ------------------------------------------------
                #
                # Every candidate always has a non-zero chance.
                #
                base_weight = 1.0
                # ------------------------------------------------
                # UNDERREPRESENTED CATEGORY BOOST
                # ------------------------------------------------
                if deficit > 0:
                    weight = (
                        base_weight
                        + (deficit * 2.0)
                    )
                else:
                    # Still possible to be selected.
                    weight = base_weight * 0.5
                # ------------------------------------------------
                # SMALL RANDOM VARIATION
                # ------------------------------------------------
                #
                # This prevents the system becoming too
                # deterministic when candidates have identical
                # characteristics.
                #
                weight *= random.uniform(
                    0.9,
                    1.1
                )
                weights.append(weight)
            # Randomly select according to the calculated weights.
            chosen = random.choices(
                remaining_candidates,
                weights=weights,
                k=1
            )[0]
            selected.append(chosen)
            remaining_candidates.remove(chosen)
        # ========================================================
        # 7. UPDATE DATABASE
        # ========================================================
        for participant in selected:
            participant.status = "Reallocated"
        db.commit()
        # ========================================================
        # 8. RETURN RESULTS
        # ========================================================
        selected_gender_counts = {
            "man": 0,
            "woman": 0,
            "other": 0
        }
        selected_participants = []
        for participant in selected:
            category = get_gender_category(participant)
            selected_gender_counts[category] += 1
            selected_participants.append({
                "id": participant.id,
                "first_name": participant.first_name,
                "last_name": participant.last_name,
                "preferred_name": participant.preferred_name,
                "university_email": participant.university_email,
                "gender": participant.gender,
                "status": participant.status
            })
        return {
            "message": (
                "Spare tickets were allocated "
                "using weighted random selection."
            ),
            "tickets_available": available_tickets,
            "tickets_allocated": len(selected),
            "tickets_remaining": (
                available_tickets - len(selected)
            ),
            "gender_distribution": {
                "man": selected_gender_counts["man"],
                "woman": selected_gender_counts["woman"],
                "other": selected_gender_counts["other"]
            },
            "participants": selected_participants
        }
    except HTTPException:
        raise
    except Exception as error:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail=(
                f"Random reallocation failed: {str(error)}"
            )
        )
# ============================================================

# ADMIN - PICKED PARTICIPANTS AWAITING CONFIRMATION

# ============================================================

@app.get("/api/admin/picked")

def get_picked_participants(
    db: Session = Depends(get_db)
):
    participants = (
        db.query(Participant)
        .filter(
            Participant.status.in_(["Picked", "Reallocated"])
        )
        .order_by(
            Participant.last_name.asc()
        )
        .all()
    )
    return [
        {
            "id": participant.id,
            "first_name": participant.first_name,
            "last_name": participant.last_name,
            "preferred_name": participant.preferred_name,
            "university_email": participant.university_email,
            "gender": participant.gender,
            "ethnicity": participant.ethnicity,
            "status": participant.status,
        }
        for participant in participants
    ]
# ============================================================

# ADMIN - STATISTICS

# ============================================================

@app.get("/api/admin/statistics")

def get_statistics(
    db: Session = Depends(get_db)
):
    # Only count people who have actually confirmed
    confirmed_participants = (
        db.query(Participant)
        .filter(
            Participant.status == "Confirmed"
        )
        .all()
    )
    # --------------------------------------------------------
    # TOTAL CONFIRMED
    # --------------------------------------------------------
    total_confirmed = len(confirmed_participants)
    # --------------------------------------------------------
    # SHIRT SIZES
    # --------------------------------------------------------
    shirt_sizes = {}
    for participant in confirmed_participants:
        size = participant.tshirt_size
        if not size:
            size = "Not specified"
        shirt_sizes[size] = (
            shirt_sizes.get(size, 0) + 1
        )
    # --------------------------------------------------------
    # ETHNICITY
    # --------------------------------------------------------
    ethnicity = {}
    for participant in confirmed_participants:
        value = participant.ethnicity
        if not value:
            value = "Not specified"
        ethnicity[value] = (
            ethnicity.get(value, 0) + 1
        )
    # --------------------------------------------------------
    # GENDER
    # --------------------------------------------------------
    gender = {}
    for participant in confirmed_participants:
        value = participant.gender
        if not value:
            value = "Not specified"
        gender[value] = (
            gender.get(value, 0) + 1
        )
    # --------------------------------------------------------
    # EMAIL OPT-INS
    # --------------------------------------------------------
    mlh_email_count = sum(
        1
        for participant in confirmed_participants
        if participant.mlh_emails == 1
    )
    sponsor_email_count = sum(
        1
        for participant in confirmed_participants
        if participant.sponsor_emails == 1
    )
    # --------------------------------------------------------
    # RETURN
    # --------------------------------------------------------
    return {
        "total_confirmed": total_confirmed,
        "shirt_sizes": shirt_sizes,
        "ethnicity": ethnicity,
        "gender": gender,
        "email_opt_ins": {
            "mlh": mlh_email_count,
            "sponsors": sponsor_email_count
        }
    }
# ============================================================

# ADMIN - EXPORT MLH EMAILS

# ============================================================

@app.get("/api/admin/export/mlh-emails")

def export_mlh_emails(
    db: Session = Depends(get_db)
):
    participants = (
        db.query(Participant)
        .filter(
            Participant.status == "Confirmed",
            Participant.mlh_emails == 1
        )
        .order_by(
            Participant.last_name.asc()
        )
        .all()
    )
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow([
        "Email"
    ])
    for participant in participants:
        writer.writerow([
            participant.university_email
        ])
    output.seek(0)
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={
            "Content-Disposition":
                "attachment; filename=mlh_email_opt_ins.csv"
        }
    )
# ============================================================

# ADMIN - EXPORT SPONSOR EMAILS

# ============================================================

@app.get("/api/admin/export/sponsor-emails")

def export_sponsor_emails(
    db: Session = Depends(get_db)
):
    participants = (
        db.query(Participant)
        .filter(
            Participant.status == "Confirmed",
            Participant.sponsor_emails == 1
        )
        .order_by(
            Participant.last_name.asc()
        )
        .all()
    )
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow([
        "Email"
    ])
    for participant in participants:
        writer.writerow([
            participant.university_email
        ])
    output.seek(0)
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={
            "Content-Disposition":
                "attachment; filename=sponsor_email_opt_ins.csv"
        }
    )
