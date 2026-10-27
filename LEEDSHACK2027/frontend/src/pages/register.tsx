import PageLayout from "../components/PageLayout";
import { useState } from "react";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { API_URL } from "../api";

const dietaryOptions = [
    {
        name: "vegetarian",
        label: "Vegetarian",
    },
    {
        name: "vegan",
        label: "Vegan",
    },
    {
        name: "halal",
        label: "Halal",
    },
    {
        name: "kosher",
        label: "Kosher",
    },
    {
        name: "gluten_free",
        label: "Gluten-free",
    },
    {
        name: "no_beef",
        label: "No beef",
    },
    {
        name: "lactose_intolerant",
        label: "Lactose intolerant",
    },
    {
        name: "dietary_other",
        label: "Other, including allergies",
    },
];

function Register() {
  const navigate = useNavigate();
  const [showSuccess, setShowSuccess] = useState(false);
  const [formData, setFormData] = useState({
      // Personal information
      firstName: "",
      lastName: "",
      preferredName: "",
      pronouns: "",
      dateOfBirth: "",
      phoneNumber: "",

      // Location
      country: "",
      otherCountry: "",

      // Education
      universityEmail: "",
      university: "",
      levelOfStudy: "",
      undergraduateYear: "",
      graduationYear: "",
      course: "",
      hackathons: "",

      // Diversity
      gender: "",
      ethnicity: "",

      // Dietary
      vegetarian: false,
      vegan: false,
      halal: false,
      kosher: false,
      gluten_free: false,
      no_beef: false,
      lactose_intolerant: false,
      dietary_other: false,
      dietaryOtherDescription: "",

      // Event
      tshirtSize: "",
      accessibility: "",

      // Social
      github: "",
      linkedin: "",

      // Team
      linkedTeamMembers: [] as string[],

      // Agreements
      mlhCodeOfConduct: false,
      mlhTerms: false,
      luuPrivacy: false,
      photography: false,
      mlhEmails: false,
      sponsorEmails: false,
  });

  const handleChange = (
      event: React.ChangeEvent<
          HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
      >
  ) => {
      const { name, value, type } = event.target;

      if (type === "checkbox") {
          const checked = (event.target as HTMLInputElement).checked;

          setFormData((previous) => ({
              ...previous,
              [name]: checked,
          }));
      } else {
          setFormData((previous) => ({
              ...previous,
              [name]: value,
          }));
      }
  };

  const universities = [
      
      "University of Leeds",
      "Leeds Beckett University",
      "University of Manchester",
      "University of Birmingham",
      "University of Bristol",
      "University of Cambridge",
      "University of Oxford",
      "Imperial College London",
      "University College London",
      "University of Edinburgh",
      "University of Glasgow",
      "University of Sheffield",
      "University of York",
      "Other",
  ];

  const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>
) => {
    event.preventDefault();

    const registrationData = {
        // Personal information
        first_name: formData.firstName,
        last_name: formData.lastName,
        preferred_name: formData.preferredName,
        pronouns: formData.pronouns,
        date_of_birth: formData.dateOfBirth,
        phone_number: formData.phoneNumber,

        // Location
        country_of_residence: formData.country,
        other_country: formData.otherCountry,

        // Education
        university_email: formData.universityEmail,
        university: formData.university,
        level_of_study: formData.levelOfStudy,
        undergraduate_year: formData.undergraduateYear,
        graduation_year: formData.graduationYear,
        course: formData.course,
        hackathons_attended: formData.hackathons,

        // Diversity
        gender: formData.gender,
        ethnicity: formData.ethnicity,

        // Dietary
        vegetarian: formData.vegetarian,
        vegan: formData.vegan,
        halal: formData.halal,
        kosher: formData.kosher,
        gluten_free: formData.gluten_free,
        no_beef: formData.no_beef,
        lactose_intolerant: formData.lactose_intolerant,
        dietary_other: formData.dietary_other,
        dietary_other_description:
            formData.dietaryOtherDescription,

        // Event
        tshirt_size: formData.tshirtSize,
        accessibility_requirements:
            formData.accessibility,

        // Social
        github_username: formData.github,
        linkedin_url: formData.linkedin,

        // Team
        linked_team_members:
            "[]",

        // Consent
        mlh_code_of_conduct:
            formData.mlhCodeOfConduct,

        mlh_terms:
            formData.mlhTerms,

        luu_privacy:
            formData.luuPrivacy,

        photography_consent:
            formData.photography,

        mlh_emails:
            formData.mlhEmails,

        sponsor_emails:
            formData.sponsorEmails,
    };

    console.log(
        "Sending registration:",
        registrationData
    );

    try {
    const response = await fetch(
        `${API_URL}/api/register`,
        {
            method: "POST",

            headers: {
                "Content-Type": "application/json",
            },

            body: JSON.stringify(registrationData),
        }
    );

    const result = await response.json();

    console.log("HTTP status:", response.status);
    console.log("Backend response:", result);

    if (response.ok) {

        alert("Registration successful!");

        console.log(
            "Registration successful:",
            result
        );
        setShowSuccess(true);
    } else {

        console.error(
            "Backend error:",
            result
        );

        let errorMessage = "Unknown error";

        // FastAPI validation errors
        if (Array.isArray(result.detail)) {

            errorMessage = result.detail
                .map((error: any) => {

                    const field = error.loc
                        ? error.loc
                            .filter(
                                (item: any) =>
                                    item !== "body"
                            )
                            .join(".")
                        : "Unknown field";

                    return `${field}: ${error.msg}`;
                })
                .join("\n");

        // Normal FastAPI error
        } else if (
            typeof result.detail === "string"
        ) {

            errorMessage = result.detail;

        // Any other object returned by the backend
        } else if (result.detail) {

            errorMessage = JSON.stringify(
                result.detail,
                null,
                2
            );
        }

        alert(
            "Registration failed:\n\n" +
            errorMessage
        );
    }

} catch (error) {

    console.error(
        "Error submitting registration:",
        error
    );

    alert(
        "Could not connect to the backend.\n\n" +
        "Make sure FastAPI is running on " +
        "`${API_URL}`"
    );
}
};
 
  return (
    <PageLayout>
    <div className="container py-5">

      {/* Header */}

      <div className="row justify-content-center">
        <div className="col-lg-9">

          <div className="text-center mb-5">
            <h1 className="display-4 fw-bold">
              LeedsHack Registration
            </h1>

            <p className="lead text-white">
              Register to attend LeedsHack 2027.
            </p>
          </div>


          <form onSubmit={handleSubmit}>

            {/* ================================================= */}
            {/* PERSONAL INFORMATION */}
            {/* ================================================= */}

            <div className="card shadow-sm mb-4">
              <div className="card-body p-4">

                <h2 className="h4 fw-bold mb-4">
                  Personal Information
                </h2>

                <div className="row">

                  <div className="col-md-6 mb-3">
                    <label
                      htmlFor="firstName"
                      className="form-label"
                    >
                      First name *
                    </label>

                    <input
                      type="text"
                      className="form-control"
                      id="firstName"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      required
                    />
                  </div>


                  <div className="col-md-6 mb-3">
                    <label
                      htmlFor="lastName"
                      className="form-label"
                    >
                      Last name *
                    </label>

                    <input
                      type="text"
                      className="form-control"
                      id="lastName"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      required
                    />
                  </div>

                </div>


                <div className="mb-3">
                  <label
                    htmlFor="preferredName"
                    className="form-label"
                  >
                    Preferred name
                  </label>

                  <input
                    type="text"
                    className="form-control"
                    id="preferredName"
                    name="preferredName"
                    value={formData.preferredName}
                    onChange={handleChange}
                    placeholder="Leave blank if same as above"
                  />
                </div>


                <div className="mb-3">
                  <label
                    htmlFor="pronouns"
                    className="form-label"
                  >
                    Pronouns
                  </label>

                  <select
                    className="form-select"
                    id="pronouns"
                    name="pronouns"
                    value={formData.pronouns}
                    onChange={handleChange}
                  >
                    <option value="">Select...</option>
                    <option value="He/Him">He/Him</option>
                    <option value="She/Her">She/Her</option>
                    <option value="They/Them">They/Them</option>
                    <option value="He/They">He/They</option>
                    <option value="She/They">She/They</option>
                    <option value="Other">Other</option>
                    <option value="Prefer not to say">
                      Prefer not to say
                    </option>
                  </select>
                </div>


                <div className="mb-3">
                  <label
                    htmlFor="dateOfBirth"
                    className="form-label"
                  >
                    How old will you be on 31st January 2027? *
                  </label>

                  <input
                    type="date"
                    className="form-control"
                    id="dateOfBirth"
                    name="dateOfBirth"
                    value={formData.dateOfBirth}
                    onChange={handleChange}
                    required
                  />

                  <div className="form-text">
                    You must be 18 or over to attend LeedsHack.
                  </div>
                </div>


                <div className="mb-3">
                  <label
                    htmlFor="phoneNumber"
                    className="form-label"
                  >
                    Phone number *
                  </label>

                  <input
                    type="tel"
                    className="form-control"
                    id="phoneNumber"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleChange}
                    placeholder="+44..."
                    required
                  />
                </div>

              </div>
            </div>


            {/* ================================================= */}
            {/* LOCATION */}
            {/* ================================================= */}

            <div className="card shadow-sm mb-4">
              <div className="card-body p-4">

                <h2 className="h4 fw-bold mb-4">
                  Location
                </h2>

                <div className="mb-3">
                  <label
                    htmlFor="country"
                    className="form-label"
                  >
                    Country of residence *
                  </label>

                  <select
                    className="form-select"
                    id="country"
                    name="country"
                    value={formData.country}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select your country...</option>
                    <option value="United Kingdom">
                      United Kingdom
                    </option>
                    <option value="United States">
                      United States
                    </option>
                    <option value="Ireland">Ireland</option>
                    <option value="France">France</option>
                    <option value="Germany">Germany</option>
                    <option value="Spain">Spain</option>
                    <option value="Italy">Italy</option>
                    <option value="India">India</option>
                    <option value="China">China</option>
                    <option value="Canada">Canada</option>
                    <option value="Australia">Australia</option>
                    <option value="Other">Other</option>
                  </select>

                  <div className="form-text">
                    International students studying in the UK should
                    select United Kingdom.
                  </div>
                </div>


                {formData.country === "Other" && (
                  <div className="mb-3">
                    <label
                      htmlFor="otherCountry"
                      className="form-label"
                    >
                      What is your country of residence? *
                    </label>

                    <input
                      type="text"
                      className="form-control"
                      id="otherCountry"
                      name="otherCountry"
                      value={formData.otherCountry}
                      onChange={handleChange}
                      required
                    />
                  </div>
                )}

              </div>
            </div>


            {/* ================================================= */}
            {/* EDUCATION */}
            {/* ================================================= */}

            <div className="card shadow-sm mb-4">
              <div className="card-body p-4">

                <h2 className="h4 fw-bold mb-4">
                  Education
                </h2>

                <div className="mb-3">
                  <label
                    htmlFor="universityEmail"
                    className="form-label"
                  >
                    University email address *
                  </label>

                  <input
                    type="email"
                    className="form-control"
                    id="universityEmail"
                    name="universityEmail"
                    value={formData.universityEmail}
                    onChange={handleChange}
                    placeholder="you@university.ac.uk"
                    required
                  />
                </div>


                <div className="mb-3">
                  <label
                    htmlFor="university"
                    className="form-label"
                  >
                    Which UK university do you currently attend? *
                  </label>

                  <select
                    className="form-select"
                    id="university"
                    name="university"
                    value={formData.university}
                    onChange={handleChange}
                    required
                  >
                    <option value="">
                      Select your university...
                    </option>

                    {universities.map((university) => (
                      <option
                        key={university}
                        value={university}
                      >
                        {university}
                      </option>
                    ))}
                  </select>
                </div>


                <div className="mb-3">
                  <label
                    htmlFor="levelOfStudy"
                    className="form-label"
                  >
                    What is your current level of study? *
                  </label>

                  <select
                    className="form-select"
                    id="levelOfStudy"
                    name="levelOfStudy"
                    value={formData.levelOfStudy}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select...</option>
                    <option value="Undergraduate">
                      Undergraduate
                    </option>
                    <option value="Postgraduate Taught">
                      Postgraduate Taught
                    </option>
                    <option value="Postgraduate Research">
                      Postgraduate Research
                    </option>
                    <option value="PhD">PhD</option>
                    <option value="Other">Other</option>
                  </select>
                </div>


                {formData.levelOfStudy === "Undergraduate" && (
                  <div className="mb-3">
                    <label
                      htmlFor="undergraduateYear"
                      className="form-label"
                    >
                      Which year of study are you in? *
                    </label>

                    <select
                      className="form-select"
                      id="undergraduateYear"
                      name="undergraduateYear"
                      value={formData.undergraduateYear}
                      onChange={handleChange}
                      required
                    >
                      <option value="">Select...</option>
                      <option value="1">Year 1</option>
                      <option value="2">Year 2</option>
                      <option value="3">Year 3</option>
                      <option value="4">Year 4</option>
                      <option value="5">Year 5+</option>
                    </select>
                  </div>
                )}


                <div className="mb-3">
                  <label
                    htmlFor="graduationYear"
                    className="form-label"
                  >
                    What year will you graduate? *
                  </label>

                  <select
                    className="form-select"
                    id="graduationYear"
                    name="graduationYear"
                    value={formData.graduationYear}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select...</option>
                    <option value="2027">2027</option>
                    <option value="2028">2028</option>
                    <option value="2029">2029</option>
                    <option value="2030">2030</option>
                    <option value="2031">2031</option>
                    <option value="2032+">2032+</option>
                  </select>
                </div>


                <div className="mb-3">
                  <label
                    htmlFor="course"
                    className="form-label"
                  >
                    What course do you currently study? *
                  </label>

                  <input
                    type="text"
                    className="form-control"
                    id="course"
                    name="course"
                    value={formData.course}
                    onChange={handleChange}
                    placeholder="e.g. Computer Science"
                    required
                  />
                </div>


                <div className="mb-3">
                  <label
                    htmlFor="hackathons"
                    className="form-label"
                  >
                    How many hackathons have you attended before? *
                  </label>

                  <select
                    className="form-select"
                    id="hackathons"
                    name="hackathons"
                    value={formData.hackathons}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select...</option>
                    <option value="0">0</option>
                    <option value="1">1</option>
                    <option value="2">2</option>
                    <option value="3">3</option>
                    <option value="4">4</option>
                    <option value="5+">5+</option>
                  </select>
                </div>

              </div>
            </div>


            {/* ================================================= */}
            {/* DIVERSITY */}
            {/* ================================================= */}

            <div className="card shadow-sm mb-4">
              <div className="card-body p-4">

                <h2 className="h4 fw-bold mb-3">
                  Diversity & Inclusion
                </h2>

                <p className="text-muted">
                  We collect this information so we can make sure
                  LeedsHack is consistently inclusive. Your individual
                  response will not be shared externally.
                </p>


                <div className="mb-3">
                  <label
                    htmlFor="gender"
                    className="form-label"
                  >
                    How would you describe your gender?
                  </label>

                  <select
                    className="form-select"
                    id="gender"
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                  >
                    <option value="">Select...</option>
                    <option value="Woman">Woman</option>
                    <option value="Man">Man</option>
                    <option value="Non-binary">
                      Non-binary
                    </option>
                    <option value="Other">Other</option>
                    <option value="Prefer not to say">
                      Prefer not to say
                    </option>
                  </select>
                </div>


                <div className="mb-3">
                  <label
                    htmlFor="ethnicity"
                    className="form-label"
                  >
                    How would you describe your race/ethnicity?
                  </label>

                  <select
                    className="form-select"
                    id="ethnicity"
                    name="ethnicity"
                    value={formData.ethnicity}
                    onChange={handleChange}
                  >
                    <option value="">Select...</option>
                    <option value="Asian / Asian British">
                      Asian / Asian British
                    </option>
                    <option value="Black / Black British">
                      Black / Black British
                    </option>
                    <option value="Mixed / Multiple ethnic groups">
                      Mixed / Multiple ethnic groups
                    </option>
                    <option value="White">
                      White
                    </option>
                    <option value="Arab">
                      Arab
                    </option>
                    <option value="Other">
                      Other
                    </option>
                    <option value="Prefer not to say">
                      Prefer not to say
                    </option>
                  </select>
                </div>

              </div>
            </div>


            {/* ================================================= */}
            {/* DIETARY */}
            {/* ================================================= */}

            <div className="card shadow-sm mb-4">
              <div className="card-body p-4">

                <h2 className="h4 fw-bold mb-3">
                  Dietary Requirements
                </h2>

                <p className="text-muted">
                  Please select all that apply.
                </p>
                {dietaryOptions.map((option) => (
                  <div
                      className="form-check mb-2"
                      key={option.name}
                  >
                  <input
                      className="form-check-input"
                      type="checkbox"
                      id={option.name}
                      name={option.name}
                      checked={
                          formData[
                              option.name as keyof typeof formData
                          ] as boolean
                      }
                      onChange={handleChange}
                  />

                    <label
                        className="form-check-label"
                        htmlFor={option.name}
                    >
                        {option.label}
                    </label>
                </div>
              ))}
              {formData.dietary_other && (
                  <div className="mt-3">

                      <label
                          htmlFor="dietaryOtherDescription"
                          className="form-label"
                      >
                          Please explain your requirements
                      </label>

                      <textarea
                          className="form-control"
                          id="dietaryOtherDescription"
                          name="dietaryOtherDescription"
                          rows={3}
                          value={formData.dietaryOtherDescription}
                          onChange={handleChange}
                          required
                      />

                  </div>
              )}
                

              </div>
            </div>


            {/* ================================================= */}
            {/* T-SHIRT */}
            {/* ================================================= */}

            <div className="card shadow-sm mb-4">
              <div className="card-body p-4">

                <h2 className="h4 fw-bold mb-3">
                  T-Shirt
                </h2>

                <div className="mb-3">
                  <label
                    htmlFor="tshirtSize"
                    className="form-label"
                  >
                    What t-shirt size would you like? *
                  </label>

                  <select
                    className="form-select"
                    id="tshirtSize"
                    name="tshirtSize"
                    value={formData.tshirtSize}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select your size...</option>
                    <option value="XS">XS</option>
                    <option value="S">S</option>
                    <option value="M">M</option>
                    <option value="L">L</option>
                    <option value="XL">XL</option>
                    <option value="XXL">XXL</option>
                    <option value="3XL">3XL</option>
                  </select>

                  <div className="form-text">
                    Please ensure that on the day you select the size
                    you requested here.
                  </div>
                </div>

              </div>
            </div>


            {/* ================================================= */}
            {/* ACCESSIBILITY */}
            {/* ================================================= */}

            <div className="card shadow-sm mb-4">
              <div className="card-body p-4">

                <h2 className="h4 fw-bold mb-3">
                  Accessibility & Other Requirements
                </h2>

                <div className="mb-3">
                  <label
                    htmlFor="accessibility"
                    className="form-label"
                  >
                    Do you have any accessibility or other requirements?
                  </label>

                  <textarea
                    className="form-control"
                    id="accessibility"
                    name="accessibility"
                    rows={4}
                    value={formData.accessibility}
                    onChange={handleChange}
                    placeholder="Please let us know anything we can do to make you comfortable."
                  />
                </div>

              </div>
            </div>


            {/* ================================================= */}
            {/* SOCIAL / PROFESSIONAL */}
            {/* ================================================= */}

            <div className="card shadow-sm mb-4">
              <div className="card-body p-4">

                <h2 className="h4 fw-bold mb-3">
                  Social & Professional Profiles
                </h2>

                <p className="text-muted">
                  These are optional and will only be shared with
                  sponsors if you give consent below.
                </p>


                <div className="mb-3">
                  <label
                    htmlFor="github"
                    className="form-label"
                  >
                    GitHub username
                  </label>

                  <input
                    type="text"
                    className="form-control"
                    id="github"
                    name="github"
                    value={formData.github}
                    onChange={handleChange}
                    placeholder="github-username"
                  />

                  <div className="form-text">
                    If you would like your GitHub username to be shared
                    with sponsors, enter it here.
                  </div>
                </div>


                <div className="mb-3">
                  <label
                    htmlFor="linkedin"
                    className="form-label"
                  >
                    LinkedIn URL
                  </label>

                  <input
                    type="url"
                    className="form-control"
                    id="linkedin"
                    name="linkedin"
                    value={formData.linkedin}
                    onChange={handleChange}
                    placeholder="https://www.linkedin.com/in/..."
                  />

                  <div className="form-text">
                    If you would like your LinkedIn URL to be shared
                    with sponsors, enter it here.
                  </div>
                </div>

              </div>
            </div>


            {/* ================================================= */}
            {/* MLH CODE OF CONDUCT */}
            {/* ================================================= */}

            <div className="card shadow-sm mb-4">
              <div className="card-body p-4">

                <h2 className="h4 fw-bold">
                  MLH Code of Conduct
                </h2>

                <p>
                  I have read and agree to the{" "}
                  <a
                    href="https://github.com/MLH/mlh-policies/blob/main/code-of-conduct.md"
                    target="_blank"
                    rel="noreferrer"
                  >
                    MLH Code of Conduct
                  </a>
                  .
                </p>

                <div className="form-check">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id="mlhCodeOfConduct"
                    name="mlhCodeOfConduct"
                    checked={formData.mlhCodeOfConduct}
                    onChange={handleChange}
                    required
                  />

                  <label
                    className="form-check-label"
                    htmlFor="mlhCodeOfConduct"
                  >
                    I agree *
                  </label>
                </div>

              </div>
            </div>


            {/* ================================================= */}
            {/* MLH TERMS */}
            {/* ================================================= */}

            <div className="card shadow-sm mb-4">
              <div className="card-body p-4">

                <h2 className="h4 fw-bold">
                  MLH Contest Terms and Conditions and Privacy Policy
                </h2>

                <p>
                  I authorise you to share my application/registration
                  information with Major League Hacking for event
                  administration, ranking, and MLH administration in-line
                  with the{" "}
                  <a
                    href="https://github.com/MLH/mlh-policies/blob/main/privacy-policy.md"
                    target="_blank"
                    rel="noreferrer"
                  >
                    MLH Privacy Policy
                  </a>
                  .
                </p>

                <p>
                  I further agree to the terms of the{" "}
                  <a
                    href="https://github.com/MLH/mlh-policies/blob/main/contest-terms.md"
                    target="_blank"
                    rel="noreferrer"
                  >
                    MLH Contest Terms and Conditions
                  </a>{" "}
                  and the{" "}
                  <a
                    href="https://github.com/MLH/mlh-policies/blob/main/privacy-policy.md"
                    target="_blank"
                    rel="noreferrer"
                  >
                    MLH Privacy Policy
                  </a>
                  .
                </p>

                <div className="form-check">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id="mlhTerms"
                    name="mlhTerms"
                    checked={formData.mlhTerms}
                    onChange={handleChange}
                    required
                  />

                  <label
                    className="form-check-label"
                    htmlFor="mlhTerms"
                  >
                    I agree *
                  </label>
                </div>

              </div>
            </div>


            {/* ================================================= */}
            {/* LUU PRIVACY */}
            {/* ================================================= */}

            <div className="card shadow-sm mb-4">
              <div className="card-body p-4">

                <h2 className="h4 fw-bold">
                  Leeds University Union Privacy Policy
                </h2>

                <p>
                  I accept the{" "}
                  <a
                    href="https://www.luu.ac.uk/privacy/"
                    target="_blank"
                    rel="noreferrer"
                  >
                    Leeds University Union Privacy Policy
                  </a>
                  .
                </p>

                <p>
                  I consent to the information I submit being shared
                  with LUU Computing Society and Leeds University Union.
                </p>

                <div className="form-check">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id="luuPrivacy"
                    name="luuPrivacy"
                    checked={formData.luuPrivacy}
                    onChange={handleChange}
                    required
                  />

                  <label
                    className="form-check-label"
                    htmlFor="luuPrivacy"
                  >
                    I agree *
                  </label>
                </div>

              </div>
            </div>


            {/* ================================================= */}
            {/* PHOTOGRAPHY */}
            {/* ================================================= */}

            <div className="card shadow-sm mb-4">
              <div className="card-body p-4">

                <h2 className="h4 fw-bold">
                  Photography / Videography
                </h2>

                <p>
                  I consent to the use of photographs and/or videos in
                  which I appear for promotional purposes related to the
                  event.
                </p>

                <div className="form-check">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id="photography"
                    name="photography"
                    checked={formData.photography}
                    onChange={handleChange}
                  />

                  <label
                    className="form-check-label"
                    htmlFor="photography"
                  >
                    I agree
                  </label>
                </div>

              </div>
            </div>


            {/* ================================================= */}
            {/* OPTIONAL MLH EMAILS */}
            {/* ================================================= */}

            <div className="card shadow-sm mb-4">
              <div className="card-body p-4">

                <h2 className="h4 fw-bold">
                  Emails from MLH
                  <span className="text-muted"> (Optional)</span>
                </h2>

                <p>
                  I authorise MLH to send me occasional emails about
                  relevant events, career opportunities, and community
                  announcements.
                </p>

                <div className="form-check">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id="mlhEmails"
                    name="mlhEmails"
                    checked={formData.mlhEmails}
                    onChange={handleChange}
                  />

                  <label
                    className="form-check-label"
                    htmlFor="mlhEmails"
                  >
                    I agree
                  </label>
                </div>

              </div>
            </div>


            {/* ================================================= */}
            {/* SPONSOR MAILING LIST */}
            {/* ================================================= */}

            <div className="card shadow-sm mb-4">
              <div className="card-body p-4">

                <h2 className="h4 fw-bold">
                  Sponsor Mailing List
                  <span className="text-muted"> (Optional)</span>
                </h2>

                <p>
                  I consent to my preferred name, email address,
                  university, degree, level of study, and graduation
                  year being shared with sponsors so they can contact
                  me about future opportunities.
                </p>

                <div className="form-check">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id="sponsorEmails"
                    name="sponsorEmails"
                    checked={formData.sponsorEmails}
                    onChange={handleChange}
                  />

                  <label
                    className="form-check-label"
                    htmlFor="sponsorEmails"
                  >
                    I agree
                  </label>
                </div>

              </div>
            </div>


            {/* ================================================= */}
            {/* TICKET INFORMATION */}
            {/* ================================================= */}

            <div className="card shadow-sm mb-4">
              <div className="card-body p-4">

                <h2 className="h4 fw-bold mb-3">
                  Ticket Information
                </h2>

                <p className="text-muted">
                  Your registration will be used to determine your
                  eligibility for a LeedsHack ticket.
                </p>

              </div>
            </div>


            {/* ================================================= */}
            {/* SUBMIT */}
            {/* ================================================= */}

            <div className="text-center mb-5">

              <button
                type="submit"
                className="btn btn-primary btn-lg px-5"
              >
                Submit Registration
              </button>

              <div className="mt-3">
                <Link
                  to="/"
                  className="text-decoration-none"
                >
                  ← Back to Home
                </Link>
              </div>

            </div>

          </form>

        </div>
      </div>
       {showSuccess && (
            <div
                className="modal fade show d-block"
                tabIndex={-1}
                role="dialog"
                style={{
                    backgroundColor: "rgba(0, 0, 0, 0.5)"
                }}
            >
                <div
                    className="modal-dialog modal-dialog-centered"
                    role="document"
                >
                    <div className="modal-content">

                        <div className="modal-header">
                            <h5 className="modal-title">
                                Registration Successful!
                            </h5>
                        </div>

                        <div className="modal-body text-center py-4">

                            <div
                                className="rounded-circle bg-success text-white d-flex align-items-center justify-content-center mx-auto mb-3"
                                style={{
                                    width: "60px",
                                    height: "60px",
                                    fontSize: "30px"
                                }}
                            >
                                ✓
                            </div>

                            <h4>
                                You're registered!
                            </h4>

                            <p className="text-muted mb-0">
                                Thank you for registering
                                for LeedsHack 2027.
                            </p>

                            <p className="text-muted">
                                We'll be in touch with more
                                information soon.
                            </p>

                        </div>

                        <div className="modal-footer justify-content-center">

                            <button
                                type="button"
                                className="btn btn-primary px-4"
                                onClick={() => navigate("/")}
                            >
                                Back to Home
                            </button>

                        </div>

                    </div>
                </div>
            </div>
        )}
    </div>
    </PageLayout>
  );
}

export default Register;