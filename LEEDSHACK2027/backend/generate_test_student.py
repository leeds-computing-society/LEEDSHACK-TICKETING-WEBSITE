"""
generate_test_data.py

Generates fake LeedsHack participants for testing.

Features:
- Generates 500 students by default
- Emails are generated directly from first_name + last_name
- Emails are unique
- Creates real 2-4 person requested teams
- Every linked team email belongs to another generated participant
- Team links are mutual
- All generated participants start as Pending
- Does NOT delete existing database records
- Avoids duplicate emails with existing records

Run:
    python generate_test_data.py
"""

import random
import json
import re
from datetime import date, timedelta

from database import SessionLocal
from models import Participant


# =========================================================
# SETTINGS
# =========================================================

NUMBER_OF_STUDENTS = 500

# Approximately 30% of generated students will belong
# to requested teams.
TEAM_PERCENTAGE = 0.30

# Team sizes will be between 2 and 4.
MIN_TEAM_SIZE = 2
MAX_TEAM_SIZE = 4

# Makes results reproducible.
RANDOM_SEED = 42

random.seed(RANDOM_SEED)


# =========================================================
# TEST DATA
# =========================================================

FIRST_NAMES = [
    "Alex",
    "Charlie",
    "Sam",
    "Jordan",
    "Taylor",
    "Jamie",
    "Morgan",
    "Casey",
    "Riley",
    "Avery",
    "Harper",
    "Ella",
    "Emily",
    "Sophie",
    "Olivia",
    "Amelia",
    "Isla",
    "Grace",
    "Mia",
    "Freya",
    "Lily",
    "Jessica",
    "Jack",
    "Harry",
    "George",
    "Oliver",
    "Noah",
    "Arthur",
    "Leo",
    "Oscar",
    "Muhammad",
    "Adam",
    "Daniel",
    "Thomas",
    "William",
    "James",
    "Ethan",
    "Lucas",
    "Henry",
    "Benjamin",
    "Hannah",
    "Ruby",
    "Evie",
    "Poppy",
    "Charlotte",
    "Lucy",
    "Daisy",
    "Florence",
    "Matilda",
    "Rosie",
]


LAST_NAMES = [
    "Smith",
    "Jones",
    "Taylor",
    "Brown",
    "Williams",
    "Wilson",
    "Johnson",
    "Davies",
    "Patel",
    "Robinson",
    "Wright",
    "Thompson",
    "Evans",
    "Walker",
    "White",
    "Roberts",
    "Green",
    "Hall",
    "Thomas",
    "Clarke",
    "Jackson",
    "Wood",
    "Harris",
    "Edwards",
    "Turner",
    "Martin",
    "Cooper",
    "Hill",
    "Ward",
    "Morris",
    "Khan",
    "Ali",
    "Shah",
    "Lewis",
    "Young",
    "King",
    "Scott",
    "Adams",
    "Baker",
    "Carter",
    "Mitchell",
    "Campbell",
    "Anderson",
    "Allen",
    "Murphy",
    "Moore",
    "Murray",
    "Stewart",
    "Grant",
]


UNIVERSITIES = [
    "University of Leeds",
    "Leeds Beckett University",
    "University of Manchester",
    "University of Sheffield",
    "University of York",
    "University of Birmingham",
    "University of Nottingham",
    "University of Bristol",
    "University of Liverpool",
    "University of Edinburgh",
]


COURSES = [
    "Computer Science",
    "Software Engineering",
    "Artificial Intelligence",
    "Data Science",
    "Mathematics",
    "Cyber Security",
    "Information Technology",
    "Electronic Engineering",
    "Physics",
    "Business Management",
    "Economics",
    "Digital Media",
]


LEVELS_OF_STUDY = [
    "Undergraduate",
    "Postgraduate",
]


PRONOUNS = [
    "He/Him",
    "She/Her",
    "They/Them",
    None,
]


GENDERS = [
    "Male",
    "Female",
    "Non-binary",
    "Prefer not to say",
    None,
]


ETHNICITIES = [
    "White",
    "Asian",
    "Black",
    "Mixed",
    "Other",
    "Prefer not to say",
    None,
]


T_SHIRT_SIZES = [
    "XS",
    "S",
    "M",
    "L",
    "XL",
    "XXL",
]


COUNTRIES = [
    "United Kingdom",
    "United States",
    "India",
    "Pakistan",
    "Nigeria",
    "China",
    "Malaysia",
    "Singapore",
    "Canada",
]


HACKATHON_HISTORY = [
    "None",
    "1",
    "2",
    "3",
    "4+",
]


# =========================================================
# EMAIL GENERATION
# =========================================================

def slugify_name(value):
    """
    Converts a name into a safe email component.

    Example:
        "Muhammad Ali"
        ->
        "muhammad.ali"
    """

    value = value.lower().strip()

    value = re.sub(
        r"[^a-z0-9]+",
        "",
        value
    )

    return value


def generate_email(first_name, last_name, used_emails):
    """
    Generates an email directly from the participant's name.

    Examples:

        Alex Smith
        -> alex.smith@test.leeds.ac.uk

        Alex Smith (duplicate)
        -> alex.smith2@test.leeds.ac.uk
    """

    first = slugify_name(first_name)
    last = slugify_name(last_name)

    base = f"{first}.{last}"
    email = f"{base}@test.leeds.ac.uk"

    counter = 2

    while email in used_emails:
        email = f"{base}{counter}@test.leeds.ac.uk"
        counter += 1

    used_emails.add(email)

    return email


# =========================================================
# RANDOM DATA
# =========================================================

def random_date_of_birth():
    """
    Generates a date of birth for someone aged approximately
    18-30.

    Returns a string because your database stores DOB as String.
    """

    today = date.today()

    min_age = 18
    max_age = 30

    earliest = date(
        today.year - max_age - 1,
        today.month,
        today.day
    )

    latest = date(
        today.year - min_age,
        today.month,
        today.day
    )

    days_between = (latest - earliest).days

    dob = earliest + timedelta(
        days=random.randint(0, days_between)
    )

    return dob.strftime("%Y-%m-%d")


def random_phone_number():
    """Generate a fake UK-style phone number."""

    return (
        "07"
        + "".join(
            str(random.randint(0, 9))
            for _ in range(9)
        )
    )


def random_dietary_requirements():
    """
    Returns all dietary flags expected by Participant.
    """

    vegetarian = 0
    vegan = 0
    halal = 0
    kosher = 0
    gluten_free = 0
    no_beef = 0
    lactose_intolerant = 0
    dietary_other = 0
    dietary_other_description = None

    # 65% have no dietary requirements.
    if random.random() < 0.65:
        return (
            vegetarian,
            vegan,
            halal,
            kosher,
            gluten_free,
            no_beef,
            lactose_intolerant,
            dietary_other,
            dietary_other_description,
        )

    requirement = random.choice([
        "vegetarian",
        "vegan",
        "halal",
        "kosher",
        "gluten_free",
        "no_beef",
        "lactose_intolerant",
        "other",
    ])

    if requirement == "vegetarian":
        vegetarian = 1

    elif requirement == "vegan":
        vegan = 1

    elif requirement == "halal":
        halal = 1

    elif requirement == "kosher":
        kosher = 1

    elif requirement == "gluten_free":
        gluten_free = 1

    elif requirement == "no_beef":
        no_beef = 1

    elif requirement == "lactose_intolerant":
        lactose_intolerant = 1

    elif requirement == "other":
        dietary_other = 1

        dietary_other_description = random.choice([
            "No pork",
            "Nut allergy",
            "Shellfish allergy",
            "No seafood",
        ])

    return (
        vegetarian,
        vegan,
        halal,
        kosher,
        gluten_free,
        no_beef,
        lactose_intolerant,
        dietary_other,
        dietary_other_description,
    )


# =========================================================
# CREATE STUDENT DATA
# =========================================================

def generate_student(
    index,
    used_emails
):
    """
    Creates a student dictionary.

    IMPORTANT:
    The name is generated FIRST.

    The email is then generated FROM that name.

    This means the email and name always correspond.
    """

    first_name = random.choice(FIRST_NAMES)

    last_name = random.choice(LAST_NAMES)

    email = generate_email(
        first_name,
        last_name,
        used_emails
    )

    university = random.choice(
        UNIVERSITIES
    )

    course = random.choice(
        COURSES
    )

    level_of_study = random.choice(
        LEVELS_OF_STUDY
    )

    # -----------------------------------------------------
    # Year of study
    # -----------------------------------------------------

    if level_of_study == "Undergraduate":

        undergraduate_year = str(
            random.randint(1, 4)
        )

        graduation_year = str(
            2027
            + (
                int(undergraduate_year) - 1
            )
        )

    else:

        undergraduate_year = None

        graduation_year = random.choice([
            "2027",
            "2028",
            "2029",
        ])

    # -----------------------------------------------------
    # Dietary requirements
    # -----------------------------------------------------

    (
        vegetarian,
        vegan,
        halal,
        kosher,
        gluten_free,
        no_beef,
        lactose_intolerant,
        dietary_other,
        dietary_other_description,
    ) = random_dietary_requirements()

    # -----------------------------------------------------
    # Preferred name
    # -----------------------------------------------------

    preferred_name = (
        first_name
        if random.random() < 0.75
        else None
    )

    # -----------------------------------------------------
    # Social accounts
    # -----------------------------------------------------

    github_username = (
        f"{slugify_name(first_name)}"
        f"{slugify_name(last_name)}"
        f"{index}"
    )

    linkedin_url = (
        f"https://www.linkedin.com/in/"
        f"{slugify_name(first_name)}-"
        f"{slugify_name(last_name)}-{index}"
    )

    # -----------------------------------------------------
    # Student object
    # -----------------------------------------------------

    return {
        "first_name": first_name,
        "last_name": last_name,
        "preferred_name": preferred_name,
        "pronouns": random.choice(PRONOUNS),

        "date_of_birth": random_date_of_birth(),
        "phone_number": random_phone_number(),

        "country_of_residence": random.choice(
            COUNTRIES
        ),
        "other_country": None,

        "university_email": email,
        "university": university,
        "level_of_study": level_of_study,
        "undergraduate_year": undergraduate_year,
        "graduation_year": graduation_year,
        "course": course,

        "hackathons_attended": random.choice(
            HACKATHON_HISTORY
        ),

        "gender": random.choice(GENDERS),
        "ethnicity": random.choice(ETHNICITIES),

        "vegetarian": vegetarian,
        "vegan": vegan,
        "halal": halal,
        "kosher": kosher,
        "gluten_free": gluten_free,
        "no_beef": no_beef,
        "lactose_intolerant": lactose_intolerant,
        "dietary_other": dietary_other,
        "dietary_other_description":
            dietary_other_description,

        "tshirt_size": random.choice(
            T_SHIRT_SIZES
        ),

        "accessibility_requirements": None,

        "github_username": github_username,
        "linkedin_url": linkedin_url,

        # Filled in later when teams are created.
        "linked_team_members": None,

        "mlh_code_of_conduct": 1,
        "mlh_terms": 1,
        "luu_privacy": 1,
        "photography_consent": 1,
        "mlh_emails": 1,
        "sponsor_emails": 1,

        "status": "Pending",
    }


# =========================================================
# CREATE REAL TEAMS
# =========================================================

def create_real_teams(students):
    """
    Creates genuine team relationships.

    Example:

        Alice
        Bob
        Charlie

    Alice:
        [bob@email, charlie@email]

    Bob:
        [alice@email, charlie@email]

    Charlie:
        [alice@email, bob@email]

    Every email therefore belongs to an actual
    participant in the database.
    """

    students = students.copy()

    random.shuffle(students)

    target_team_members = int(
        len(students) * TEAM_PERCENTAGE
    )

    # Make sure the target can form complete teams.
    target_team_members = (
        target_team_members
        // MIN_TEAM_SIZE
    ) * MIN_TEAM_SIZE

    team_students = students[
        :target_team_members
    ]

    remaining_students = students[
        target_team_members:
    ]

    teams = []

    position = 0

    while position < len(team_students):

        remaining = (
            len(team_students) - position
        )

        # If only one person remains, attach them
        # to the previous team instead of making
        # a one-person team.
        if remaining == 1:

            if teams:

                teams[-1].append(
                    team_students[position]
                )

            break

        possible_sizes = [
            size
            for size in range(
                MIN_TEAM_SIZE,
                MAX_TEAM_SIZE + 1
            )
            if size <= remaining
        ]

        team_size = random.choice(
            possible_sizes
        )

        team = team_students[
            position:
            position + team_size
        ]

        teams.append(team)

        position += team_size

    # -----------------------------------------------------
    # Add linked emails
    # -----------------------------------------------------

    for team in teams:

        team_emails = [
            student["university_email"]
            for student in team
        ]

        for student in team:

            student["linked_team_members"] = [
                email
                for email in team_emails
                if email != student[
                    "university_email"
                ]
            ]

    # -----------------------------------------------------
    # Everyone else has no team request.
    # -----------------------------------------------------

    for student in remaining_students:

        student["linked_team_members"] = None

    return students, teams


# =========================================================
# CREATE DATABASE PARTICIPANT
# =========================================================

def create_participant(student):
    """
    Converts generated student data into your
    actual SQLAlchemy Participant model.
    """

    linked_team_members = (
        json.dumps(
            student["linked_team_members"]
        )
        if student["linked_team_members"]
        else None
    )

    return Participant(

        # =================================================
        # Personal information
        # =================================================

        first_name=student["first_name"],

        last_name=student["last_name"],

        preferred_name=student[
            "preferred_name"
        ],

        pronouns=student[
            "pronouns"
        ],

        date_of_birth=student[
            "date_of_birth"
        ],

        phone_number=student[
            "phone_number"
        ],

        # =================================================
        # Location
        # =================================================

        country_of_residence=student[
            "country_of_residence"
        ],

        other_country=student[
            "other_country"
        ],

        # =================================================
        # Education
        # =================================================

        university_email=student[
            "university_email"
        ],

        university=student[
            "university"
        ],

        level_of_study=student[
            "level_of_study"
        ],

        undergraduate_year=student[
            "undergraduate_year"
        ],

        graduation_year=student[
            "graduation_year"
        ],

        course=student[
            "course"
        ],

        hackathons_attended=student[
            "hackathons_attended"
        ],

        # =================================================
        # Diversity
        # =================================================

        gender=student["gender"],

        ethnicity=student["ethnicity"],

        # =================================================
        # Dietary requirements
        # =================================================

        vegetarian=student[
            "vegetarian"
        ],

        vegan=student[
            "vegan"
        ],

        halal=student[
            "halal"
        ],

        kosher=student[
            "kosher"
        ],

        gluten_free=student[
            "gluten_free"
        ],

        no_beef=student[
            "no_beef"
        ],

        lactose_intolerant=student[
            "lactose_intolerant"
        ],

        dietary_other=student[
            "dietary_other"
        ],

        dietary_other_description=student[
            "dietary_other_description"
        ],

        # =================================================
        # Event
        # =================================================

        tshirt_size=student[
            "tshirt_size"
        ],

        accessibility_requirements=student[
            "accessibility_requirements"
        ],

        # =================================================
        # Social
        # =================================================

        github_username=student[
            "github_username"
        ],

        linkedin_url=student[
            "linkedin_url"
        ],

        # =================================================
        # Team
        # =================================================

        linked_team_members=linked_team_members,

        # =================================================
        # Consent
        # =================================================

        mlh_code_of_conduct=student[
            "mlh_code_of_conduct"
        ],

        mlh_terms=student[
            "mlh_terms"
        ],

        luu_privacy=student[
            "luu_privacy"
        ],

        photography_consent=student[
            "photography_consent"
        ],

        mlh_emails=student[
            "mlh_emails"
        ],

        sponsor_emails=student[
            "sponsor_emails"
        ],

        # =================================================
        # Administration
        # =================================================

        status="Pending",
    )


# =========================================================
# VALIDATE TEAM LINKS
# =========================================================

def validate_team_links(students):
    """
    Checks that every linked team email:

    1. Exists in the generated students.
    2. Is not the student's own email.
    3. Is mutually linked.
    """

    email_to_student = {
        student["university_email"]: student
        for student in students
    }

    errors = []

    for student in students:

        email = student[
            "university_email"
        ]

        linked_members = (
            student["linked_team_members"]
            or []
        )

        for linked_email in linked_members:

            # ---------------------------------------------
            # Does the linked participant exist?
            # ---------------------------------------------

            if linked_email not in email_to_student:

                errors.append(
                    f"{email} links to "
                    f"{linked_email}, but that "
                    f"participant does not exist."
                )

                continue

            # ---------------------------------------------
            # Don't allow someone to link themselves.
            # ---------------------------------------------

            if linked_email == email:

                errors.append(
                    f"{email} is linked to "
                    f"themselves."
                )

                continue

            # ---------------------------------------------
            # Check the relationship is mutual.
            # ---------------------------------------------

            linked_student = email_to_student[
                linked_email
            ]

            linked_student_members = (
                linked_student[
                    "linked_team_members"
                ]
                or []
            )

            if email not in linked_student_members:

                errors.append(
                    f"Team link is not mutual: "
                    f"{email} -> {linked_email}"
                )

    if errors:

        print()
        print("TEAM VALIDATION FAILED")
        print("-" * 60)

        for error in errors:
            print(error)

        raise ValueError(
            "Generated team data is invalid."
        )

    print("Team links validated successfully.")


# =========================================================
# MAIN GENERATOR
# =========================================================

def generate_test_data():

    db = SessionLocal()

    try:

        print()
        print("=" * 70)
        print("LEEDSHACK TEST DATA GENERATOR")
        print("=" * 70)
        print()

        # -------------------------------------------------
        # Existing participants
        # -------------------------------------------------

        existing_participants = (
            db.query(Participant).all()
        )

        existing_emails = {
            participant.university_email
            for participant
            in existing_participants
        }

        print(
            f"Existing participants: "
            f"{len(existing_participants)}"
        )

        print(
            f"Generating "
            f"{NUMBER_OF_STUDENTS} "
            f"new test participants..."
        )

        print()

        # -------------------------------------------------
        # Generate students
        # -------------------------------------------------

        students = []

        for index in range(
            1,
            NUMBER_OF_STUDENTS + 1
        ):

            student = generate_student(
                index=index,
                used_emails=existing_emails,
            )

            students.append(student)

        # -------------------------------------------------
        # Create real teams
        # -------------------------------------------------

        students, teams = create_real_teams(
            students
        )

        print(
            f"Generated {len(teams)} "
            f"requested teams."
        )

        # -------------------------------------------------
        # Validate EVERYTHING before touching DB
        # -------------------------------------------------

        validate_team_links(
            students
        )

        # -------------------------------------------------
        # Insert participants
        # -------------------------------------------------

        print()
        print("Adding participants to database...")

        for student in students:

            participant = create_participant(
                student
            )

            db.add(participant)

        # -------------------------------------------------
        # Commit
        # -------------------------------------------------

        db.commit()

        # -------------------------------------------------
        # Database statistics
        # -------------------------------------------------

        total_database_count = (
            db.query(Participant)
            .count()
        )

        generated_team_people = sum(
            1
            for student in students
            if student[
                "linked_team_members"
            ]
        )

        generated_solo_people = (
            len(students)
            - generated_team_people
        )

        # -------------------------------------------------
        # Success
        # -------------------------------------------------

        print()
        print("=" * 70)
        print("SUCCESS")
        print("=" * 70)

        print(
            f"Generated participants: "
            f"{len(students)}"
        )

        print(
            f"People in requested teams: "
            f"{generated_team_people}"
        )

        print(
            f"People without team requests: "
            f"{generated_solo_people}"
        )

        print(
            f"Requested teams created: "
            f"{len(teams)}"
        )

        print(
            f"Total participants in database: "
            f"{total_database_count}"
        )

        print()

        # -------------------------------------------------
        # Show examples
        # -------------------------------------------------

        if teams:

            print(
                "Example generated team:"
            )

            print("-" * 70)

            example_team = teams[0]

            for member in example_team:

                print(
                    f"{member['first_name']} "
                    f"{member['last_name']}"
                )

                print(
                    f"  Email: "
                    f"{member['university_email']}"
                )

                print(
                    f"  Linked members: "
                    f"{member['linked_team_members']}"
                )

                print()

        # -------------------------------------------------
        # Show some generated students
        # -------------------------------------------------

        print(
            "Example generated students:"
        )

        print("-" * 70)

        for student in students[:10]:

            print(
                f"{student['first_name']} "
                f"{student['last_name']} "
                f"-> "
                f"{student['university_email']}"
            )

        print()

    except Exception as error:

        db.rollback()

        print()
        print("=" * 70)
        print("ERROR")
        print("=" * 70)

        print(error)

        raise

    finally:

        db.close()


# =========================================================
# RUN
# =========================================================

if __name__ == "__main__":
    generate_test_data()