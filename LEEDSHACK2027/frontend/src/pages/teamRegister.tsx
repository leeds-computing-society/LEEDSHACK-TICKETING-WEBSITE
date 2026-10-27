import PageLayout from "../components/PageLayout";
import { useState } from "react";
import { Link ,useNavigate } from "react-router-dom";

function TeamRegister() {
  const navigate = useNavigate();

  const [showSuccess, setShowSuccess] = useState(false);

  const [showError, setShowError] = useState(false);

  const [formData, setFormData] = useState({
    email1: "",
    email2: "",
    email3: "",
    email4: "",
  });

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData({
      ...formData,
      [event.target.name]: event.target.value,
    });
  };

  const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>
) => {
    event.preventDefault();

    const teamData = {
        email1: formData.email1,
        email2: formData.email2,
        email3: formData.email3 || null,
        email4: formData.email4 || null,
    };

    console.log("Sending team:", teamData);

    try {

        const response = await fetch(
            "http://localhost:8000/api/team-register",
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json",
                },

                body: JSON.stringify(teamData),
            }
        );

        const result = await response.json();

        console.log(
            "HTTP status:",
            response.status
        );

        console.log(
            "Backend response:",
            result
        );

        if (response.ok) {

            alert(
                "Team created successfully!"
            );

            console.log(
                "Team members:",
                result.team_members
            );

            setShowSuccess(true);

        } else {

            let errorMessage =
                "Unknown error";

            if (
                Array.isArray(result.detail)
            ) {

                errorMessage =
                    result.detail
                        .map(
                            (error: any) =>
                                error.msg
                        )
                        .join("\n");

            } else if (
                typeof result.detail ===
                "string"
            ) {

                errorMessage =
                    result.detail;
            }

            console.error(
                "Team signup failed:\n\n" +
                errorMessage
            );

            setShowError(true);
        }

    } catch (error) {

        console.error(
            "Error creating team:",
            error
        );

        alert(
            "Could not connect to the backend.\n\n" +
            "Make sure FastAPI is running on " +
            "http://localhost:8000"
        );
    }
};

  return (
    <PageLayout>
    <div className="container py-5">

      <div className="row justify-content-center">

        <div className="col-md-8 col-lg-6">

          <div className="card shadow">

            <div className="card-body p-4 p-md-5">

              {/* Header */}

              <div className="text-center mb-4">
                <h1 className="fw-bold">Team Signup</h1>

                <p className="text-muted">
                  Create your hackathon team
                </p>
              </div>


              {/* Information */}

              <div className="alert alert-info">
                <strong>Team size:</strong> 2–4 people
                <br />
                You must enter 1-3 other participants you would like to team up with. Please note each participant must register on their own, and if you don't have a team, you can make one on the day.
              </div>


              <form onSubmit={handleSubmit}>

                {/* Your Email */}

                <div className="mb-3">
                  <label
                    htmlFor="email1"
                    className="form-label"
                  >
                    Your Email
                  </label>

                  <input
                    type="email"
                    className="form-control"
                    id="email1"
                    name="email1"
                    value={formData.email1}
                    onChange={handleChange}
                    placeholder="you@example.com"
                    required
                  />

                  <div className="form-text">
                    This is the email you used to register for
                    the event.
                  </div>
                </div>


                {/* Teammate 1 */}

                <div className="mb-3">
                  <label
                    htmlFor="email2"
                    className="form-label"
                  >
                    Teammate 1 Email
                  </label>

                  <input
                    type="email"
                    className="form-control"
                    id="email2"
                    name="email2"
                    value={formData.email2}
                    onChange={handleChange}
                    placeholder="teammate@example.com"
                    required
                  />
                </div>


                {/* Teammate 2 */}

                <div className="mb-3">
                  <label
                    htmlFor="email3"
                    className="form-label"
                  >
                    Teammate 2 Email
                    <span className="text-muted"> (Optional)</span>
                  </label>

                  <input
                    type="email"
                    className="form-control"
                    id="email3"
                    name="email3"
                    value={formData.email3}
                    onChange={handleChange}
                    placeholder="teammate@example.com"
                  />
                </div>


                {/* Teammate 3 */}

                <div className="mb-4">
                  <label
                    htmlFor="email4"
                    className="form-label"
                  >
                    Teammate 3 Email
                    <span className="text-muted"> (Optional)</span>
                  </label>

                  <input
                    type="email"
                    className="form-control"
                    id="email4"
                    name="email4"
                    value={formData.email4}
                    onChange={handleChange}
                    placeholder="teammate@example.com"
                  />
                </div>


                {/* Submit */}

                <div className="d-grid">
                  <button
                    type="submit"
                    className="btn btn-success btn-lg"
                  >
                    Create Team
                  </button>
                </div>

              </form>
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

                {/* Header */}
                <div className="modal-header">
                    <h5 className="modal-title">
                        Team Created Successfully!
                    </h5>
                </div>

                {/* Body */}
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

                    <h4 className="mb-3">
                        Your team is registered!
                    </h4>

                    <p className="text-muted mb-2">
                        Your team members have been
                        successfully linked.
                    </p>

                    <p className="text-muted mb-0">
                        Good luck at LeedsHack 2026!
                    </p>

                </div>

                {/* Footer */}
                <div className="modal-footer justify-content-center">

                    <button
                        type="button"
                        className="btn btn-primary btn-lg px-4"
                        onClick={() => navigate("/")}
                    >
                        Back to Home
                    </button>

                </div>

            </div>
        </div>
    </div>
)}

{showError && (
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

                {/* Header */}
                <div className="modal-header">
                    <h5 className="modal-title">
                        Unable to Create Team
                    </h5>
                </div>

                {/* Body */}
                <div className="modal-body text-center py-4">

                    <div
                        className="rounded-circle bg-danger text-white d-flex align-items-center justify-content-center mx-auto mb-3"
                        style={{
                            width: "60px",
                            height: "60px",
                            fontSize: "30px"
                        }}
                    >
                        !
                    </div>

                    <h4 className="mb-3">
                        Team signup unsuccessful
                    </h4>

                    <p className="text-muted mb-0">
                        We couldn't create your team.
                    </p>

                    <p className="text-muted">
                          Please make sure all participants have registered and that nobody is already assigned to a team.
                          Then try again.
                    </p>

                </div>

                {/* Footer */}
                <div className="modal-footer justify-content-center">

                    <button
                        type="button"
                        className="btn btn-primary px-4"
                        onClick={() =>
                            setShowError(false)
                        }
                    >
                        Try Again
                    </button>

                </div>

            </div>
        </div>
    </div>
)}

              {/* Back */}

              <div className="text-center mt-4">
                <Link
                  to="/"
                  className="text-decoration-none"
                >
                  ← Back to Home
                </Link>
              </div>

            </div>

          </div>

        </div>
      
      </div>
  
    </div>
    </PageLayout>
  );
}

export default TeamRegister;