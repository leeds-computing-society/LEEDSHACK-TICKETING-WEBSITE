import PageLayout from "../components/PageLayout";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_URL } from "../api";
function Confirmation() {
    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [canAttend, setCanAttend] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);
    const [status, setStatus] = useState("");

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        setError("");
        setLoading(true);

        if (!email) {
            setError("Please enter your university email address.");
            setLoading(false);
            return;
        }

        if (!canAttend) {
            setError("Please select whether you can attend.");
            setLoading(false);
            return;
        }

        try {
            const response = await fetch(
                `${API_URL}/api/confirm-attendance`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        university_email: email,
                        can_attend: canAttend === "yes",
                    }),
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.detail || "Unable to update your attendance."
                );
            }

            setStatus(data.status);
            setSuccess(true);
        } catch (err) {
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError("Something went wrong. Please try again.");
            }
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="container py-5">
                <div className="row justify-content-center">
                    <div className="col-md-8 col-lg-6">
                        <div className="card border-0 shadow-sm">
                            <div className="card-body text-center p-5">

                                {status === "Confirmed" ? (
                                    <>
                                        <div className="display-1 mb-4">
                                            🎉
                                        </div>

                                        <h1 className="fw-bold mb-3">
                                            You're confirmed!
                                        </h1>

                                        <p className="lead">
                                            Your place at LeedsHack 2027 has
                                            been confirmed.
                                        </p>

                                        <p className="text-muted">
                                            We can't wait to see you at the
                                            hackathon!
                                        </p>
                                    </>
                                ) : (
                                    <>
                                        <div className="display-1 mb-4">
                                            👋
                                        </div>

                                        <h1 className="fw-bold mb-3">
                                            Attendance cancelled
                                        </h1>

                                        <p className="lead">
                                            We've recorded that you won't be
                                            attending LeedsHack 2027.
                                        </p>

                                        <p className="text-muted">
                                            Your registration has been marked
                                            as cancelled.
                                        </p>
                                    </>
                                )}

                                <button
                                    type="button"
                                    className="btn btn-primary mt-3 px-4"
                                    onClick={() => navigate("/")}
                                >
                                    Back to Home
                                </button>

                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <PageLayout>
        <div className="container py-5">

            <div className="row justify-content-center">

                <div className="col-md-8 col-lg-6">

                    {/* Header */}
                    <div className="text-center mb-4">

                        <h1 className="fw-bold">
                            Confirm Your Attendance
                        </h1>

                        <p className="text-white mb-0">
                            LeedsHack 2027
                        </p>

                        
                    </div>

                    {/* Main Card */}
                    <div className="card border-0 shadow-sm">

                        <div className="card-body p-4 p-md-5">

                            <p className="mb-4">
                                Thanks for registering for LeedsHack 2027!
                                Please confirm whether you are still able to
                                attend the hackathon.
                            </p>

                            <form onSubmit={handleSubmit}>

                                {/* Email */}
                                <div className="mb-4">

                                    <label
                                        htmlFor="email"
                                        className="form-label fw-semibold"
                                    >
                                        University Email Address
                                    </label>

                                    <input
                                        type="email"
                                        id="email"
                                        className="form-control"
                                        placeholder="your.email@university.ac.uk"
                                        value={email}
                                        onChange={(event) =>
                                            setEmail(event.target.value)
                                        }
                                        required
                                    />

                                    <div className="form-text">
                                        Please use the email address you used
                                        when registering for LeedsHack.
                                    </div>

                                </div>

                                {/* Attendance */}
                                <div className="mb-4">

                                    <label className="form-label fw-semibold">
                                        Will you be attending LeedsHack 2027?
                                    </label>

                                    <div className="form-check mb-2">

                                        <input
                                            className="form-check-input"
                                            type="radio"
                                            name="attendance"
                                            id="attending"
                                            value="yes"
                                            checked={canAttend === "yes"}
                                            onChange={(event) =>
                                                setCanAttend(
                                                    event.target.value
                                                )
                                            }
                                        />

                                        <label
                                            className="form-check-label"
                                            htmlFor="attending"
                                        >
                                            <strong>Yes</strong> — I can attend
                                            LeedsHack 2027
                                        </label>

                                    </div>

                                    <div className="form-check">

                                        <input
                                            className="form-check-input"
                                            type="radio"
                                            name="attendance"
                                            id="not-attending"
                                            value="no"
                                            checked={canAttend === "no"}
                                            onChange={(event) =>
                                                setCanAttend(
                                                    event.target.value
                                                )
                                            }
                                        />

                                        <label
                                            className="form-check-label"
                                            htmlFor="not-attending"
                                        >
                                            <strong>No</strong> — I can no
                                            longer attend
                                        </label>

                                    </div>

                                </div>

                                {/* Error */}
                                {error && (
                                    <div
                                        className="alert alert-danger"
                                        role="alert"
                                    >
                                        {error}
                                    </div>
                                )}

                                {/* Submit */}
                                <button
                                    type="submit"
                                    className="btn btn-primary w-100 py-2"
                                    disabled={loading}
                                >
                                    {loading
                                        ? "Submitting..."
                                        : "Confirm Attendance"}
                                </button>

                            </form>

                        </div>

                    </div>

                    {/* Footer */}
                    <div className="text-center mt-4">

                        <button
                            type="button"
                            className="btn btn-link text-decoration-none"
                            onClick={() => navigate("/")}
                        >
                            ← Back to Home
                        </button>

                    </div>

                </div>

            </div>

        </div>
        </PageLayout>
    );
}

export default Confirmation;

