import { useEffect, useState } from "react";
import { API_URL } from "../api";

/* =========================================================
   TYPES
   ========================================================= */

interface Attendee {
    id: number;
    first_name: string;
    last_name: string;
    preferred_name: string | null;
    university_email: string;
    university: string;

    status:
        | "Pending"
        | "Picked"
        | "notPicked"
        | "Confirmed"
        | "Cancelled"
        | "Reallocated";

    linked_team_members: string[];
}

interface Participant {
    id: number;
    first_name: string;
    last_name: string;
    preferred_name?: string | null;
    university_email: string;
    gender?: string | null;
    ethnicity?: string | null;

    status:
        | "Pending"
        | "Picked"
        | "notPicked"
        | "Confirmed"
        | "Cancelled"
        | "Reallocated";
}

interface Statistics {
    total_confirmed: number;

    shirt_sizes: {
        [key: string]: number;
    };

    ethnicity: {
        [key: string]: number;
    };

    gender: {
        [key: string]: number;
    };

    email_opt_ins: {
        mlh: number;
        sponsors: number;
    };
}

/* =========================================================
   ADMIN COMPONENT
   ========================================================= */

function Admin() {
    /* =========================================================
       STATISTICS
       ========================================================= */

    const [statistics, setStatistics] =
        useState<Statistics | null>(null);

    const [loadingStatistics, setLoadingStatistics] =
        useState(false);

    const fetchStatistics = async () => {
        try {
            setLoadingStatistics(true);

            const response = await fetch(
                `${API_URL}/api/admin/statistics`
            );

            if (!response.ok) {
                const data = await response.json();

                throw new Error(
                    data.detail ||
                        "Failed to load statistics."
                );
            }

            const data = await response.json();

            console.log(
                "STATISTICS:",
                data
            );

            setStatistics(data);
        } catch (error) {
            console.error(
                "Statistics error:",
                error
            );

            alert(
                error instanceof Error
                    ? error.message
                    : "Could not load statistics."
            );
        } finally {
            setLoadingStatistics(false);
        }
    };

    /* =========================================================
       PASSWORD
       ========================================================= */

    const [password, setPassword] = useState("");
    const [authenticated, setAuthenticated] =
        useState(false);
    const [passwordError, setPasswordError] =
        useState("");

    /* =========================================================
       TEAM ASSIGNMENT
       ========================================================= */

    const [showTeamSuccess, setShowTeamSuccess] =
        useState(false);

    const [numberOfTeams, setNumberOfTeams] =
        useState(0);

    const [assigningTeams, setAssigningTeams] =
        useState(false);

    /* =========================================================
       ATTENDEES / DATABASE
       ========================================================= */

    const [attendees, setAttendees] =
        useState<Attendee[]>([]);

    const [loadingAttendees, setLoadingAttendees] =
        useState(false);

    /* =========================================================
       DATABASE COMMANDS
       ========================================================= */

    

    const [deletingDatabase, setDeletingDatabase] =
        useState(false);

    const [databaseDeleteSuccess, setDatabaseDeleteSuccess] =
        useState(false);

    /* =========================================================
       RANDOM TEAM SELECTION
       ========================================================= */

    const [randomPicking, setRandomPicking] =
        useState(false);

    const [randomPickResult, setRandomPickResult] =
        useState<{
            people_picked: number;
            teams_picked: number;
            people_not_picked: number;
        } | null>(null);

    /* =========================================================
       EMAILS
       ========================================================= */

    const [sendingEmails, setSendingEmails] =
        useState(false);

    const [sendingConfirmationInvitations, setSendingConfirmationInvitations] =
        useState(false);

    const [sendingReallocationEmails, setSendingReallocationEmails] =
        useState(false);

    /* =========================================================
       CONFIRMATION / REALLOCATION
       ========================================================= */

    const [confirmedPeople, setConfirmedPeople] =
        useState<Participant[]>([]);

    const [reallocationPeople, setReallocationPeople] =
        useState<Participant[]>([]);

    const [loadingConfirmation, setLoadingConfirmation] =
        useState(false);

    const [confirmationError, setConfirmationError] =
        useState("");

    const [pickedPeople, setPickedPeople] =
        useState<Participant[]>([]);

    /* =========================================================
       RANDOM SPARE TICKET REALLOCATION
       ========================================================= */

    const [randomReallocation, setRandomReallocation] =
        useState(false);

    const [reallocationResult, setReallocationResult] =
        useState<{
            tickets_available: number;
            tickets_allocated: number;
            tickets_remaining: number;
            gender_distribution: {
                man: number;
                woman: number;
                other: number;
            };
        } | null>(null);
        

    /* =========================================================
       FETCH DATABASE
       ========================================================= */

    const fetchAttendees = async () => {
        try {
            setLoadingAttendees(true);

            const response = await fetch(
                `${API_URL}/api/admin/participants`
            );

            if (!response.ok) {
                throw new Error(
                    "Failed to load attendees."
                );
            }

            const data = await response.json();

            console.log(
                "RAW DATABASE DATA:",
                data
            );

            const formattedAttendees: Attendee[] =
                data.map(
                    (attendee: any) => {
                        let teamMembers: string[] = [];

                        /*
                         * linked_team_members is stored in SQLite
                         * as JSON TEXT.
                         */

                        if (
                            Array.isArray(
                                attendee.linked_team_members
                            )
                        ) {
                            teamMembers =
                                attendee.linked_team_members;
                        } else if (
                            typeof attendee.linked_team_members ===
                            "string"
                        ) {
                            try {
                                const parsed =
                                    JSON.parse(
                                        attendee.linked_team_members
                                    );

                                if (
                                    Array.isArray(
                                        parsed
                                    )
                                ) {
                                    teamMembers =
                                        parsed;
                                }
                            } catch (error) {
                                console.error(
                                    "Failed to parse linked team members:",
                                    attendee.linked_team_members,
                                    error
                                );
                            }
                        }

                        return {
                            ...attendee,
                            linked_team_members:
                                teamMembers,
                        };
                    }
                );

            console.log(
                "FORMATTED ATTENDEES:",
                formattedAttendees
            );

            setAttendees(
                formattedAttendees
            );
        } catch (error) {
            console.error(
                "Error loading attendees:",
                error
            );

            alert(
                "Could not load the database. " +
                    "Make sure FastAPI is running."
            );
        } finally {
            setLoadingAttendees(false);
        }
    };

    /* =========================================================
       FETCH CONFIRMED / REALLOCATION DATA
       ========================================================= */

    const loadConfirmationData =
        async () => {
            try {
                setLoadingConfirmation(
                    true
                );

                const [
                    pickedResponse,
                    confirmedResponse,
                    reallocationResponse,
                ] = await Promise.all([
                    fetch(
                        `${API_URL}/api/admin/picked`
                    ),
                    fetch(
                        `${API_URL}/api/admin/confirmed`
                    ),
                    fetch(
                        `${API_URL}/api/admin/reallocation`
                    ),
                ]);

                if (!pickedResponse.ok) {
                    throw new Error(
                        "Failed to load picked participants."
                    );
                }

                if (!confirmedResponse.ok) {
                    throw new Error(
                        "Failed to load confirmed participants."
                    );
                }

                if (!reallocationResponse.ok) {
                    throw new Error(
                        "Failed to load reallocation participants."
                    );
                }

                const pickedData =
                    await pickedResponse.json();

                const confirmedData =
                    await confirmedResponse.json();

                const reallocationData =
                    await reallocationResponse.json();

                setPickedPeople(
                    pickedData
                );

                setConfirmedPeople(
                    confirmedData
                );

                setReallocationPeople(
                    reallocationData
                );
            } catch (err) {
                console.error(
                    "Confirmation data error:",
                    err
                );

                if (err instanceof Error) {
                    console.log(
                        err.message
                    );
                } else {
                    console.log(
                        "Failed to load confirmation data."
                    );
                }
            } finally {
                setLoadingConfirmation(
                    false
                );
            }
        };

    /* =========================================================
       LOGIN
       ========================================================= */

    const handleLogin = (
        event: React.FormEvent<HTMLFormElement>
    ) => {
        event.preventDefault();

        if (password === "123") {
            setAuthenticated(true);
            setPasswordError("");
        } else {
            setPasswordError(
                "Incorrect password."
            );
        }
    };

    /* =========================================================
       LOAD DATA AFTER LOGIN
       ========================================================= */

    useEffect(() => {
        if (authenticated) {
            fetchAttendees();
            loadConfirmationData();
            fetchStatistics();
        }
    }, [authenticated]);

    /* =========================================================
       ASSIGN TEAMS
       ========================================================= */

    const handleAssignTeams =
        async () => {
            if (assigningTeams) {
                return;
            }

            const confirmed =
                window.confirm(
                    "Are you sure you want to assign teams?\n\n" +
                        "Existing team requests will be kept together " +
                        "where possible.\n\n" +
                        "This will update the database."
                );

            if (!confirmed) {
                return;
            }

            try {
                setAssigningTeams(
                    true
                );

                const response =
                    await fetch(
                        `${API_URL}/api/admin/assign-teams`,
                        {
                            method: "POST",
                            headers: {
                                "Content-Type":
                                    "application/json",
                            },
                        }
                    );

                const result =
                    await response.json();

                console.log(
                    "Team assignment response:",
                    result
                );

                if (!response.ok) {
                    throw new Error(
                        result.detail ||
                            "Could not assign teams."
                    );
                }

                setNumberOfTeams(
                    result.number_of_teams ||
                        0
                );

                await fetchAttendees();

                setShowTeamSuccess(
                    true
                );
            } catch (error) {
                console.error(
                    "Team assignment error:",
                    error
                );

                alert(
                    error instanceof Error
                        ? error.message
                        : "Could not assign teams."
                );
            } finally {
                setAssigningTeams(
                    false
                );
            }
        };

 

    /* =========================================================
       DELETE DATABASE
       ========================================================= */

    const handleDeleteDatabase =
        async () => {
            if (deletingDatabase) {
                return;
            }

            const firstConfirmation =
                window.confirm(
                    "⚠️ WARNING\n\n" +
                        "You are about to delete ALL registered attendees " +
                        "from the database.\n\n" +
                        "This action cannot be undone.\n\n" +
                        "Do you want to continue?"
                );

            if (!firstConfirmation) {
                return;
            }

            const secondConfirmation =
                window.confirm(
                    "🚨 FINAL CONFIRMATION 🚨\n\n" +
                        "Are you ABSOLUTELY SURE?\n\n" +
                        "This will permanently delete ALL registered " +
                        "participants from the database.\n\n" +
                        "Click OK to permanently delete the database."
                );

            if (!secondConfirmation) {
                return;
            }

            try {
                setDeletingDatabase(
                    true
                );

                const response =
                    await fetch(
                        `${API_URL}/api/admin/delete-database`,
                        {
                            method: "DELETE",
                        }
                    );

                const result =
                    await response.json();

                console.log(
                    "Delete database response:",
                    result
                );

                if (!response.ok) {
                    throw new Error(
                        result.detail ||
                            "Failed to delete database."
                    );
                }

                await fetchAttendees();
                await loadConfirmationData();

                setDatabaseDeleteSuccess(
                    true
                );
            } catch (error) {
                console.error(
                    "Database deletion error:",
                    error
                );

                alert(
                    error instanceof Error
                        ? error.message
                        : "Could not delete the database."
                );
            } finally {
                setDeletingDatabase(
                    false
                );
            }
        };

    /* =========================================================
       RANDOM TEAM SELECTION
       ========================================================= */

    const handleRandomPick =
        async () => {
            if (randomPicking) {
                return;
            }

            const confirmed =
                window.confirm(
                    "Are you sure you want to randomly select teams?\n\n" +
                        "Whole teams will be selected until a maximum of " +
                        "200 people has been reached.\n\n" +
                        "All remaining Pending applicants will become Not Picked."
                );

            if (!confirmed) {
                return;
            }

            try {
                setRandomPicking(
                    true
                );

                const response =
                    await fetch(
                        `${API_URL}/api/admin/random-pick`,
                        {
                            method: "POST",
                            headers: {
                                "Content-Type":
                                    "application/json",
                            },
                        }
                    );

                const result =
                    await response.json();

                console.log(
                    "Random selection result:",
                    result
                );

                if (!response.ok) {
                    throw new Error(
                        result.detail ||
                            "Could not randomly select teams."
                    );
                }

                setRandomPickResult({
                    people_picked:
                        result.people_picked ||
                        0,

                    teams_picked:
                        result.teams_picked ||
                        0,

                    people_not_picked:
                        result.people_not_picked ||
                        0,
                });

                await fetchAttendees();
                await loadConfirmationData();
            } catch (error) {
                console.error(
                    "Random selection error:",
                    error
                );

                alert(
                    error instanceof Error
                        ? error.message
                        : "Could not randomly select teams."
                );
            } finally {
                setRandomPicking(
                    false
                );
            }
        };

    /* =========================================================
       EMAIL WORKFLOWS
       ========================================================= */

    const runEmailWorkflow = async (
        endpoint: string,
        confirmationMessage: string,
        setLoading: (value: boolean) => void
    ) => {
        if (
            sendingEmails ||
            sendingConfirmationInvitations ||
            sendingReallocationEmails
        ) {
            return;
        }

        if (!window.confirm(confirmationMessage)) {
            return;
        }

        try {
            setLoading(true);

            const response = await fetch(
                `${API_URL}${endpoint}`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                }
            );

            const result = await response.json();

            if (!response.ok) {
                throw new Error(
                    result.detail || "The email workflow failed."
                );
            }

            const processed = result.emails_sent ?? (
                (result.picked_emails ?? 0) +
                (result.not_picked_emails ?? 0)
            );

            const dryRunMessage = result.dry_run
                ? "\n\nDRY RUN: No real emails were sent. Check your backend terminal."
                : "";

            alert(
                `${result.message || "Email workflow completed."}\n\n` +
                `Processed: ${processed}\n` +
                `Failed: ${result.failed ?? 0}` +
                dryRunMessage
            );
        } catch (error) {
            console.error("Email workflow error:", error);

            alert(
                error instanceof Error
                    ? error.message
                    : "An unexpected error occurred."
            );
        } finally {
            setLoading(false);
        }
    };

    const handleSendEmails = () =>
        runEmailWorkflow(
            "/api/admin/send-emails",
            "Send initial application emails to Picked and notPicked participants?\n\nThis may process emails for everyone in those statuses.",
            setSendingEmails
        );

    const handleSendConfirmationInvitations = () =>
        runEmailWorkflow(
            "/api/admin/send-confirmation-invitations",
            "Send confirmation invitations to all participants whose status is Picked?",
            setSendingConfirmationInvitations
        );

    const handleSendReallocationEmails = () =>
        runEmailWorkflow(
            "/api/admin/send-reallocation-emails",
            "Send reallocation offers and confirmation links to all participants whose status is Reallocated?",
            setSendingReallocationEmails
        );

    /* =========================================================
       RANDOM SPARE TICKET REALLOCATION
       ========================================================= */

    const handleRandomReallocation =
        async () => {
            if (randomReallocation) {
                return;
            }

            const confirmed =
                window.confirm(
                    "Automatically allocate spare tickets?\n\n" +
                        "Eligible participants will be selected using " +
                        "a random lottery.\n\n" +
                        "Administrators will NOT be able to choose " +
                        "individual participants.\n\n" +
                        "Continue?"
                );

            if (!confirmed) {
                return;
            }

            try {
                setRandomReallocation(
                    true
                );

                setConfirmationError(
                    ""
                );

                setReallocationResult(
                    null
                );

                const response =
                    await fetch(
                        `${API_URL}/api/admin/reallocate-random`,
                        {
                            method: "POST",
                            headers: {
                                "Content-Type":
                                    "application/json",
                            },
                        }
                    );

                const result =
                    await response.json();

                console.log(
                    "Random reallocation result:",
                    result
                );

                if (!response.ok) {
                    throw new Error(
                        result.detail ||
                            "Could not randomly allocate spare tickets."
                    );
                }

                setReallocationResult({
                    tickets_available:
                        result.tickets_available ||
                        0,

                    tickets_allocated:
                        result.tickets_allocated ||
                        0,

                    tickets_remaining:
                        result.tickets_remaining ||
                        0,

                    gender_distribution:
                        result.gender_distribution ||
                        {
                            man: 0,
                            woman: 0,
                            other: 0,
                        },
                });

                await fetchAttendees();
                await loadConfirmationData();
                await fetchStatistics();
            } catch (error) {
                console.error(
                    "Random reallocation error:",
                    error
                );

                setConfirmationError(
                    error instanceof Error
                        ? error.message
                        : "Could not randomly allocate spare tickets."
                );
            } finally {
                setRandomReallocation(
                    false
                );
            }
        };

    /* =========================================================
       PASSWORD SCREEN
       ========================================================= */

    if (!authenticated) {
        return (
            <div className="container py-5">
                <div className="row justify-content-center">
                    <div className="col-md-5 col-lg-4">

                        <div className="card shadow">

                            <div className="card-body p-4">

                                <div className="text-center mb-4">

                                    <h1 className="fw-bold">
                                        Admin Login
                                    </h1>

                                    <p className="text-muted">
                                        LeedsHack Administration
                                    </p>

                                </div>

                                <form
                                    onSubmit={
                                        handleLogin
                                    }
                                >

                                    <div className="mb-3">

                                        <label
                                            htmlFor="adminPassword"
                                            className="form-label"
                                        >
                                            Password
                                        </label>

                                        <input
                                            type="password"
                                            className={`form-control ${
                                                passwordError
                                                    ? "is-invalid"
                                                    : ""
                                            }`}
                                            id="adminPassword"
                                            value={password}
                                            onChange={(
                                                event
                                            ) =>
                                                setPassword(
                                                    event.target
                                                        .value
                                                )
                                            }
                                            placeholder="Enter admin password"
                                            required
                                        />

                                        {passwordError && (
                                            <div className="invalid-feedback">
                                                {
                                                    passwordError
                                                }
                                            </div>
                                        )}

                                    </div>

                                    <div className="d-grid">

                                        <button
                                            type="submit"
                                            className="btn btn-dark btn-lg"
                                        >
                                            Login
                                        </button>

                                    </div>

                                </form>

                            </div>

                        </div>

                    </div>
                </div>
            </div>
        );
    }

    /* =========================================================
       ADMIN DASHBOARD
       ========================================================= */

    return (
        <div className="container-fluid py-4">

            {/* =====================================================
                HEADER
                ===================================================== */}

            <div className="position-relative d-flex justify-content-center align-items-center mb-4 text-center">

                <div>

                    <h1 className="fw-bold mb-1">
                        Admin Dashboard
                    </h1>

                    <p className="text-muted mb-0">
                        LeedsHack Administration Panel
                    </p>

                </div>

                <button
                    className="btn btn-outline-danger position-absolute end-0 me-3"
                    onClick={() => {
                        setAuthenticated(
                            false
                        );
                        setPassword("");
                        setAttendees([]);
                        setConfirmedPeople(
                            []
                        );
                        setReallocationPeople(
                            []
                        );
                        setPickedPeople(
                            []
                        );
                        setReallocationResult(
                            null
                        );
                        setConfirmationError(
                            ""
                        );
                    }}
                >
                    Logout
                </button>

            </div>

            {/* =====================================================
                ACCORDION
                ===================================================== */}

            <div
                className="accordion"
                id="adminAccordion"
            >

                {/* ===================================================
                    DATABASE COMMANDS
                    =================================================== */}

                <div className="accordion-item">

                    <h2 className="accordion-header">

                        <button
                            className="accordion-button"
                            type="button"
                            data-bs-toggle="collapse"
                            data-bs-target="#databaseCommands"
                        >
                            🗄️ Database Commands
                        </button>

                    </h2>

                    <div
                        id="databaseCommands"
                        className="accordion-collapse collapse show"
                        data-bs-parent="#adminAccordion"
                    >

                        <div className="accordion-body">

                            <div className="mb-4">

                                <h3 className="h5 mb-1">
                                    Database Management
                                </h3>

                                <p className="text-muted mb-0">
                                    Manage the LeedsHack
                                    registration database.
                                </p>

                            </div>

                            <div className="card border-danger">

                                <div className="card-header bg-danger text-white">

                                    <strong>
                                        ⚠️ Danger Zone
                                    </strong>

                                </div>

                                <div className="card-body">

                                    <h5 className="card-title">
                                        Delete All Participants
                                    </h5>

                                    <p className="card-text text-muted">
                                        Permanently removes all
                                        registered participants
                                        from the database.
                                    </p>

                                    <p className="text-danger small mb-3">

                                        <strong>
                                            Warning:
                                        </strong>{" "}
                                        This action cannot be
                                        undone.

                                    </p>

                                    <button
                                        type="button"
                                        className="btn btn-danger"
                                        onClick={
                                            handleDeleteDatabase
                                        }
                                        disabled={
                                            deletingDatabase
                                        }
                                    >

                                        {deletingDatabase ? (
                                            <>
                                                <span
                                                    className="spinner-border spinner-border-sm me-2"
                                                    role="status"
                                                    aria-hidden="true"
                                                />

                                                Deleting...
                                            </>
                                        ) : (
                                            <>
                                                🗑️ Delete All
                                                Participants
                                            </>
                                        )}

                                    </button>

                                </div>

                            </div>

                            {databaseDeleteSuccess && (

                                <div
                                    className="alert alert-success alert-dismissible fade show mt-3"
                                    role="alert"
                                >

                                    <strong>
                                        Database cleared
                                        successfully.
                                    </strong>

                                    <br />

                                    All registered participants
                                    have been removed from the
                                    database.

                                    <button
                                        type="button"
                                        className="btn-close"
                                        aria-label="Close"
                                        onClick={() =>
                                            setDatabaseDeleteSuccess(
                                                false
                                            )
                                        }
                                    />

                                </div>

                            )}

                        </div>

                    </div>

                </div>

                {/* ===================================================
                    ATTENDEE MANAGEMENT
                    =================================================== */}

                <div className="accordion-item">

                    <h2 className="accordion-header">

                        <button
                            className="accordion-button collapsed"
                            type="button"
                            data-bs-toggle="collapse"
                            data-bs-target="#attendeeManagement"
                        >
                            👥 Attendee Management
                        </button>

                    </h2>

                    <div
                        id="attendeeManagement"
                        className="accordion-collapse collapse"
                        data-bs-parent="#adminAccordion"
                    >

                        <div className="accordion-body">

                            <div className="d-flex justify-content-between align-items-center mb-3">

                                <div>

                                    <h3 className="h5 mb-1">
                                        Registered Attendees
                                    </h3>

                                    <p className="text-muted mb-0">
                                        View all registered
                                        attendees and their
                                        assigned teams.
                                    </p>

                                </div>

                                <button
                                    className="btn btn-outline-primary"
                                    onClick={
                                        fetchAttendees
                                    }
                                    disabled={
                                        loadingAttendees
                                    }
                                >
                                    {loadingAttendees
                                        ? "Refreshing..."
                                        : "Refresh Database"}
                                </button>

                            </div>

                            <div className="table-responsive">

                                <table className="table table-bordered table-hover align-middle">

                                    <thead className="table-dark">

                                        <tr>
                                            <th>ID</th>
                                            <th>Name</th>
                                            <th>Email</th>
                                            <th>University</th>
                                            <th>Status</th>
                                            <th>Team Members</th>
                                        </tr>

                                    </thead>

                                    <tbody>

                                        {loadingAttendees ? (

                                            <tr>

                                                <td
                                                    colSpan={6}
                                                    className="text-center py-4"
                                                >

                                                    <div
                                                        className="spinner-border me-2"
                                                        role="status"
                                                    />

                                                    Loading database...

                                                </td>

                                            </tr>

                                        ) : attendees.length ===
                                          0 ? (

                                            <tr>

                                                <td
                                                    colSpan={6}
                                                    className="text-center py-4"
                                                >
                                                    No registered
                                                    attendees.
                                                </td>

                                            </tr>

                                        ) : (

                                            attendees.map(
                                                (
                                                    attendee
                                                ) => (

                                                    <tr
                                                        key={
                                                            attendee.id
                                                        }
                                                    >

                                                        <td>
                                                            {
                                                                attendee.id
                                                            }
                                                        </td>

                                                        <td>

                                                            <strong>
                                                                {
                                                                    attendee.preferred_name ||
                                                                    `${attendee.first_name} ${attendee.last_name}`
                                                                }
                                                            </strong>

                                                            {attendee.preferred_name && (

                                                                <div className="small text-muted">

                                                                    {
                                                                        attendee.first_name
                                                                    }{" "}

                                                                    {
                                                                        attendee.last_name
                                                                    }

                                                                </div>

                                                            )}

                                                        </td>

                                                        <td>
                                                            {
                                                                attendee.university_email
                                                            }
                                                        </td>

                                                        <td>
                                                            {
                                                                attendee.university
                                                            }
                                                        </td>

                                                        <td>

                                                            {attendee.status ===
                                                                "Confirmed" && (
                                                                <span className="badge text-bg-success">
                                                                    Confirmed
                                                                </span>
                                                            )}

                                                            {attendee.status ===
                                                                "Pending" && (
                                                                <span className="badge text-bg-warning">
                                                                    Pending
                                                                </span>
                                                            )}

                                                            {attendee.status ===
                                                                "Picked" && (
                                                                <span className="badge text-bg-primary">
                                                                    Picked
                                                                </span>
                                                            )}

                                                            {attendee.status ===
                                                                "notPicked" && (
                                                                <span className="badge text-bg-secondary">
                                                                    Not Picked
                                                                </span>
                                                            )}

                                                            {attendee.status ===
                                                                "Cancelled" && (
                                                                <span className="badge text-bg-danger">
                                                                    Cancelled
                                                                </span>
                                                            )}

                                                            {attendee.status ===
                                                                "Reallocated" && (
                                                                <span className="badge text-bg-warning">
                                                                    Reallocated
                                                                </span>
                                                            )}

                                                        </td>

                                                        <td>

                                                            {attendee
                                                                .linked_team_members
                                                                .length ===
                                                            0 ? (

                                                                <span className="text-muted">
                                                                    No team assigned
                                                                </span>

                                                            ) : (

                                                                <div>

                                                                    <div className="mb-2">

                                                                        <span className="badge text-bg-primary">

                                                                            Team of{" "}
                                                                            {
                                                                                attendee
                                                                                    .linked_team_members
                                                                                    .length +
                                                                                1
                                                                            }

                                                                        </span>

                                                                    </div>

                                                                    <ul className="list-unstyled mb-0">

                                                                        <li className="mb-1">

                                                                            <strong>
                                                                                {
                                                                                    attendee.university_email
                                                                                }
                                                                            </strong>

                                                                            <span className="text-muted ms-2">
                                                                                (You)
                                                                            </span>

                                                                        </li>

                                                                        {attendee.linked_team_members.map(
                                                                            (
                                                                                email,
                                                                                index
                                                                            ) => (

                                                                                <li
                                                                                    key={`${attendee.id}-${index}`}
                                                                                    className="mb-1"
                                                                                >

                                                                                    <span className="text-muted me-2">
                                                                                        •
                                                                                    </span>

                                                                                    {
                                                                                        email
                                                                                    }

                                                                                </li>

                                                                            )
                                                                        )}

                                                                    </ul>

                                                                </div>

                                                            )}

                                                        </td>

                                                    </tr>

                                                )
                                            )

                                        )}

                                    </tbody>

                                </table>

                            </div>

                        </div>

                    </div>

                </div>

                {/* ===================================================
                    TEAMS & EMAILS
                    =================================================== */}

                <div className="accordion-item">

                    <h2 className="accordion-header">

                        <button
                            className="accordion-button collapsed"
                            type="button"
                            data-bs-toggle="collapse"
                            data-bs-target="#teamsAndEmails"
                        >
                            📨 Teams & Emails
                        </button>

                    </h2>

                    <div
                        id="teamsAndEmails"
                        className="accordion-collapse collapse"
                        data-bs-parent="#adminAccordion"
                    >

                        <div className="accordion-body">

                            <div className="row g-4">

                                {/* ASSIGN TEAMS */}

                                <div className="col-md-4">

                                    <div className="card h-100">

                                        <div className="card-body">

                                            <h3 className="h5">
                                                👥 Assign Teams
                                            </h3>

                                            <p className="text-muted">
                                                Automatically assign
                                                registered attendees
                                                into teams of up to
                                                4 while keeping
                                                existing team
                                                requests together.
                                            </p>

                                            <button
                                                className="btn btn-primary"
                                                onClick={
                                                    handleAssignTeams
                                                }
                                                disabled={
                                                    assigningTeams
                                                }
                                            >

                                                {assigningTeams ? (
                                                    <>
                                                        <span
                                                            className="spinner-border spinner-border-sm me-2"
                                                            role="status"
                                                            aria-hidden="true"
                                                        />

                                                        Assigning Teams...
                                                    </>
                                                ) : (
                                                    "Assign Teams"
                                                )}

                                            </button>

                                        </div>

                                    </div>

                                </div>

                                {/* RANDOM SELECTION */}

                                <div className="col-md-4">

                                    <div className="card h-100">

                                        <div className="card-body">

                                            <h3 className="h5">
                                                🎲 Random Selection
                                            </h3>

                                            <p className="text-muted">
                                                Randomly select complete
                                                teams from the Pending
                                                applicants up to a
                                                maximum of 200 people.
                                            </p>

                                            <button
                                                className="btn btn-warning"
                                                onClick={
                                                    handleRandomPick
                                                }
                                                disabled={
                                                    randomPicking
                                                }
                                            >

                                                {randomPicking ? (
                                                    <>
                                                        <span
                                                            className="spinner-border spinner-border-sm me-2"
                                                            role="status"
                                                            aria-hidden="true"
                                                        />

                                                        Selecting Teams...
                                                    </>
                                                ) : (
                                                    "Randomly Select Teams"
                                                )}

                                            </button>

                                            {randomPickResult && (

                                                <div className="alert alert-success mt-3 mb-0">

                                                    <strong>
                                                        Selection complete
                                                    </strong>

                                                    <div className="small mt-2">

                                                        Teams picked:{" "}

                                                        <strong>
                                                            {
                                                                randomPickResult.teams_picked
                                                            }
                                                        </strong>

                                                    </div>

                                                    <div className="small">

                                                        People picked:{" "}

                                                        <strong>
                                                            {
                                                                randomPickResult.people_picked
                                                            }
                                                        </strong>

                                                    </div>

                                                    <div className="small">

                                                        Not picked:{" "}

                                                        <strong>
                                                            {
                                                                randomPickResult.people_not_picked
                                                            }
                                                        </strong>

                                                    </div>

                                                </div>

                                            )}

                                        </div>

                                    </div>

                                </div>

                                {/* INITIAL APPLICATION EMAILS */}
                                <div className="col-md-6 col-xl-4">
                                    <div className="card h-100">
                                        <div className="card-body d-flex flex-column">
                                            <h3 className="h5">📧 Initial Application Emails</h3>
                                            <p className="text-muted">
                                                Send the initial outcome email to Picked participants and
                                                the unsuccessful application email to notPicked participants.
                                            </p>
                                            <button
                                                type="button"
                                                className="btn btn-success mt-auto"
                                                onClick={handleSendEmails}
                                                disabled={sendingEmails || sendingConfirmationInvitations || sendingReallocationEmails}
                                            >
                                                {sendingEmails ? (
                                                    <><span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true" />Processing...</>
                                                ) : "Send Initial Emails"}
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* CONFIRMATION INVITATIONS */}
                                <div className="col-md-6 col-xl-4">
                                    <div className="card h-100">
                                        <div className="card-body d-flex flex-column">
                                            <h3 className="h5">✉️ Confirmation Invitations</h3>
                                            <p className="text-muted">
                                                Send the confirmation form link to participants with Picked status
                                                who have not yet confirmed their attendance.
                                            </p>
                                            <button
                                                type="button"
                                                className="btn btn-primary mt-auto"
                                                onClick={handleSendConfirmationInvitations}
                                                disabled={sendingEmails || sendingConfirmationInvitations || sendingReallocationEmails}
                                            >
                                                {sendingConfirmationInvitations ? (
                                                    <><span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true" />Processing...</>
                                                ) : "Send Confirmation Invitations"}
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* REALLOCATION EMAILS */}
                                <div className="col-md-6 col-xl-4">
                                    <div className="card h-100">
                                        <div className="card-body d-flex flex-column">
                                            <h3 className="h5">🎟️ Reallocation Emails</h3>
                                            <p className="text-muted">
                                                Send reallocated participants their offer email and confirmation link.
                                            </p>
                                            <button
                                                type="button"
                                                className="btn btn-warning mt-auto"
                                                onClick={handleSendReallocationEmails}
                                                disabled={sendingEmails || sendingConfirmationInvitations || sendingReallocationEmails}
                                            >
                                                {sendingReallocationEmails ? (
                                                    <><span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true" />Processing...</>
                                                ) : "Send Reallocation Emails"}
                                            </button>
                                        </div>
                                    </div>
                                </div>

                            </div>

                        </div>

                    </div>

                </div>

                {/* ===================================================
                    CONFIRMATION & REALLOCATION
                    =================================================== */}

                <div className="accordion-item">

                    <h2 className="accordion-header">

                        <button
                            className="accordion-button collapsed"
                            type="button"
                            data-bs-toggle="collapse"
                            data-bs-target="#confirmationReallocation"
                        >
                            🔄 Confirmation & Reallocation
                        </button>

                    </h2>

                    <div
                        id="confirmationReallocation"
                        className="accordion-collapse collapse"
                        data-bs-parent="#adminAccordion"
                    >

                        <div className="accordion-body">

                            <div className="mb-4">

                                <h3 className="h4 fw-bold">
                                    Confirmation & Reallocation
                                </h3>

                                <p className="text-muted">
                                    Manage picked and confirmed
                                    attendees. Spare tickets are
                                    automatically allocated using
                                    a random lottery rather than
                                    being manually selected by an
                                    administrator.
                                </p>

                            </div>

                            {confirmationError && (

                                <div className="alert alert-danger">

                                    {confirmationError}

                                </div>

                            )}

                            {/* =================================================
                                PICKED - AWAITING CONFIRMATION
                                ================================================= */}

                            <div className="card border-0 shadow-sm mb-5">

                                <div className="card-header bg-primary text-white">

                                    <div className="d-flex justify-content-between align-items-center">

                                        <div>

                                            <h4 className="mb-0">
                                                Picked — Awaiting Confirmation
                                            </h4>

                                            <small>
                                                Participants who have
                                                been picked but have
                                                not yet confirmed
                                                their attendance.
                                            </small>

                                        </div>

                                        <span className="badge bg-light text-dark">
                                            {
                                                pickedPeople.length
                                            }
                                        </span>

                                    </div>

                                </div>

                                <div className="card-body p-0">

                                    {pickedPeople.length ===
                                    0 ? (

                                        <div className="p-4 text-center text-muted">
                                            No participants are
                                            currently awaiting
                                            confirmation.
                                        </div>

                                    ) : (

                                        <div className="table-responsive">

                                            <table className="table table-hover mb-0">

                                                <thead className="table-light">

                                                    <tr>

                                                        <th>
                                                            Name
                                                        </th>

                                                        <th>
                                                            Email
                                                        </th>

                                                        <th>
                                                            Gender
                                                        </th>

                                                        <th>
                                                            Ethnicity
                                                        </th>

                                                        <th>
                                                            Status
                                                        </th>

                                                    </tr>

                                                </thead>

                                                <tbody>

                                                    {pickedPeople.map(
                                                        (
                                                            person
                                                        ) => (

                                                            <tr
                                                                key={
                                                                    person.id
                                                                }
                                                            >

                                                                <td>

                                                                    <strong>
                                                                        {
                                                                            person.preferred_name ||
                                                                            `${person.first_name} ${person.last_name}`
                                                                        }
                                                                    </strong>

                                                                    {person.preferred_name && (

                                                                        <div className="small text-muted">

                                                                            {
                                                                                person.first_name
                                                                            }{" "}

                                                                            {
                                                                                person.last_name
                                                                            }

                                                                        </div>

                                                                    )}

                                                                </td>

                                                                <td>
                                                                    {
                                                                        person.university_email
                                                                    }
                                                                </td>

                                                                <td>
                                                                    {
                                                                        person.gender ||
                                                                        "Not specified"
                                                                    }
                                                                </td>

                                                                <td>
                                                                    {
                                                                        person.ethnicity ||
                                                                        "Not specified"
                                                                    }
                                                                </td>

                                                                <td>

                                                                    <span className="badge bg-primary">
                                                                        Picked
                                                                    </span>

                                                                </td>

                                                            </tr>

                                                        )
                                                    )}

                                                </tbody>

                                            </table>

                                        </div>

                                    )}

                                </div>

                            </div>

                            {/* =================================================
                                CONFIRMED PEOPLE
                                ================================================= */}

                            <div className="card border-0 shadow-sm mb-5">

                                <div className="card-header bg-success text-white">

                                    <div className="d-flex justify-content-between align-items-center">

                                        <div>

                                            <h4 className="mb-0">
                                                Confirmed Attendees
                                            </h4>

                                            <small>
                                                These people have
                                                been picked and
                                                have confirmed that
                                                they can attend.
                                            </small>

                                        </div>

                                        <span className="badge bg-light text-dark">
                                            {
                                                confirmedPeople.length
                                            }
                                        </span>

                                    </div>

                                </div>

                                <div className="card-body p-0">

                                    {loadingConfirmation ? (

                                        <div className="text-center py-5">

                                            <div
                                                className="spinner-border"
                                                role="status"
                                            >

                                                <span className="visually-hidden">
                                                    Loading...
                                                </span>

                                            </div>

                                        </div>

                                    ) : confirmedPeople.length ===
                                      0 ? (

                                        <div className="p-4 text-center text-muted">
                                            No confirmed attendees
                                            yet.
                                        </div>

                                    ) : (

                                        <div className="table-responsive">

                                            <table className="table table-hover align-middle mb-0">

                                                <thead className="table-light">

                                                    <tr>

                                                        <th>
                                                            Name
                                                        </th>

                                                        <th>
                                                            Email
                                                        </th>

                                                        <th>
                                                            Gender
                                                        </th>

                                                        <th>
                                                            Ethnicity
                                                        </th>

                                                        <th>
                                                            Status
                                                        </th>

                                                    </tr>

                                                </thead>

                                                <tbody>

                                                    {confirmedPeople.map(
                                                        (
                                                            person
                                                        ) => (

                                                            <tr
                                                                key={
                                                                    person.id
                                                                }
                                                            >

                                                                <td>

                                                                    <strong>
                                                                        {
                                                                            person.preferred_name ||
                                                                            `${person.first_name} ${person.last_name}`
                                                                        }
                                                                    </strong>

                                                                    {person.preferred_name && (

                                                                        <div className="small text-muted">

                                                                            {
                                                                                person.first_name
                                                                            }{" "}

                                                                            {
                                                                                person.last_name
                                                                            }

                                                                        </div>

                                                                    )}

                                                                </td>

                                                                <td>
                                                                    {
                                                                        person.university_email
                                                                    }
                                                                </td>

                                                                <td>
                                                                    {
                                                                        person.gender ||
                                                                        "Not specified"
                                                                    }
                                                                </td>

                                                                <td>
                                                                    {
                                                                        person.ethnicity ||
                                                                        "Not specified"
                                                                    }
                                                                </td>

                                                                <td>

                                                                    <span className="badge bg-success">
                                                                        Confirmed
                                                                    </span>

                                                                </td>

                                                            </tr>

                                                        )
                                                    )}

                                                </tbody>

                                            </table>

                                        </div>

                                    )}

                                </div>

                            </div>

                            {/* =================================================
                                AUTOMATIC SPARE TICKET REALLOCATION
                                ================================================= */}

                            <div className="card border-0 shadow-sm">

                                <div className="card-header bg-warning">

                                    <div className="d-flex justify-content-between align-items-center">

                                        <div>

                                            <h4 className="mb-0">
                                                🎲 Spare Ticket Allocation
                                            </h4>

                                            <small className="text-dark">
                                                Automatically allocate
                                                available tickets using
                                                a random lottery.
                                            </small>

                                        </div>

                                        <span className="badge bg-dark">
                                            {
                                                reallocationPeople.length
                                            }{" "}
                                            eligible
                                        </span>

                                    </div>

                                </div>

                                <div className="card-body">

                                    <div className="row g-4">

                                        {/* EXPLANATION */}

                                        <div className="col-lg-7">

                                            <h5 className="fw-bold">
                                                Fair Random Reallocation
                                            </h5>

                                            <p className="text-muted">
                                                When tickets become
                                                available, eligible
                                                participants are selected
                                                automatically rather than
                                                manually by an
                                                administrator.
                                            </p>

                                            <p className="text-muted">
                                                Every eligible participant
                                                enters the same random
                                                lottery, so administrators
                                                cannot favour individual
                                                applicants.
                                            </p>

                                            <div className="alert alert-info mb-0">

                                                <strong>
                                                    No manual selection
                                                </strong>

                                                <br />

                                                Administrators cannot
                                                choose individual
                                                participants for spare
                                                tickets. The gender
                                                distribution shown after
                                                the draw is descriptive
                                                only and does not affect
                                                who is selected.

                                            </div>

                                        </div>

                                        {/* ALLOCATION ACTION */}

                                        <div className="col-lg-5">

                                            <div className="card bg-light border">

                                                <div className="card-body">

                                                    <h5 className="fw-bold">
                                                        Available Applicants
                                                    </h5>

                                                    <div className="display-5 fw-bold mb-2">
                                                        {
                                                            reallocationPeople.length
                                                        }
                                                    </div>

                                                    <p className="text-muted">
                                                        Participants currently
                                                        eligible for a spare
                                                        ticket.
                                                    </p>

                                                    <button
                                                        type="button"
                                                        className="btn btn-dark w-100"
                                                        onClick={
                                                            handleRandomReallocation
                                                        }
                                                        disabled={
                                                            randomReallocation ||
                                                            reallocationPeople.length ===
                                                                0
                                                        }
                                                    >

                                                        {randomReallocation ? (
                                                            <>
                                                                <span
                                                                    className="spinner-border spinner-border-sm me-2"
                                                                    role="status"
                                                                    aria-hidden="true"
                                                                />

                                                                Allocating Tickets...
                                                            </>
                                                        ) : (
                                                            <>
                                                                🎲 Randomly Allocate
                                                                Spare Tickets
                                                            </>
                                                        )}

                                                    </button>

                                                </div>

                                            </div>

                                        </div>

                                    </div>

                                    {/* =================================================
                                        RESULT
                                        ================================================= */}

                                    {reallocationResult && (

                                        <div className="alert alert-success mt-4 mb-0">

                                            <h5 className="fw-bold">
                                                Spare Ticket Allocation Complete
                                            </h5>

                                            <div className="row g-3 mt-1">

                                                <div className="col-md-4">

                                                    <div className="border rounded p-3 bg-white">

                                                        <div className="text-muted small">
                                                            TICKETS AVAILABLE
                                                        </div>

                                                        <div className="fs-3 fw-bold">
                                                            {
                                                                reallocationResult
                                                                    .tickets_available
                                                            }
                                                        </div>

                                                    </div>

                                                </div>

                                                <div className="col-md-4">

                                                    <div className="border rounded p-3 bg-white">

                                                        <div className="text-muted small">
                                                            TICKETS ALLOCATED
                                                        </div>

                                                        <div className="fs-3 fw-bold">
                                                            {
                                                                reallocationResult
                                                                    .tickets_allocated
                                                            }
                                                        </div>

                                                    </div>

                                                </div>

                                                <div className="col-md-4">

                                                    <div className="border rounded p-3 bg-white">

                                                        <div className="text-muted small">
                                                            TICKETS REMAINING
                                                        </div>

                                                        <div className="fs-3 fw-bold">
                                                            {
                                                                reallocationResult
                                                                    .tickets_remaining
                                                            }
                                                        </div>

                                                    </div>

                                                </div>

                                            </div>

                                            {/* POST-SELECTION DEMOGRAPHIC BREAKDOWN */}

                                            <div className="mt-4">

                                                <h6 className="fw-bold">
                                                    Selected Gender Distribution
                                                </h6>

                                                <p className="text-muted small">
                                                    This is a post-selection
                                                    breakdown only. Gender
                                                    does not affect the
                                                    lottery.
                                                </p>

                                                <div className="row g-2">

                                                    <div className="col-md-4">

                                                        <div className="border rounded p-2 bg-white">

                                                            <strong>
                                                                Man
                                                            </strong>

                                                            <span className="float-end">
                                                                {
                                                                    reallocationResult
                                                                        .gender_distribution
                                                                        .man
                                                                }
                                                            </span>

                                                        </div>

                                                    </div>

                                                    <div className="col-md-4">

                                                        <div className="border rounded p-2 bg-white">

                                                            <strong>
                                                                Woman
                                                            </strong>

                                                            <span className="float-end">
                                                                {
                                                                    reallocationResult
                                                                        .gender_distribution
                                                                        .woman
                                                                }
                                                            </span>

                                                        </div>

                                                    </div>

                                                    <div className="col-md-4">

                                                        <div className="border rounded p-2 bg-white">

                                                            <strong>
                                                                Other
                                                            </strong>

                                                            <span className="float-end">
                                                                {
                                                                    reallocationResult
                                                                        .gender_distribution
                                                                        .other
                                                                }
                                                            </span>

                                                        </div>

                                                    </div>

                                                </div>

                                            </div>

                                        </div>

                                    )}

                                </div>

                            </div>

                        </div>

                    </div>

                </div>

                {/* ===================================================
                    STATISTICS
                    =================================================== */}

                <div className="accordion-item">

                    <h2 className="accordion-header">

                        <button
                            className="accordion-button collapsed"
                            type="button"
                            data-bs-toggle="collapse"
                            data-bs-target="#statistics"
                        >
                            📊 Statistics
                        </button>

                    </h2>

                    <div
                        id="statistics"
                        className="accordion-collapse collapse"
                        data-bs-parent="#adminAccordion"
                    >

                        <div className="accordion-body">

                            <div className="d-flex justify-content-between align-items-center mb-4">

                                <div>

                                    <h3 className="h4 mb-1">
                                        Hackathon Statistics
                                    </h3>

                                    <p className="text-muted mb-0">
                                        Statistics for confirmed attendees.
                                    </p>

                                </div>

                                <button
                                    type="button"
                                    className="btn btn-outline-primary"
                                    onClick={
                                        fetchStatistics
                                    }
                                    disabled={
                                        loadingStatistics
                                    }
                                >
                                    {loadingStatistics
                                        ? "Refreshing..."
                                        : "Refresh Statistics"}
                                </button>

                            </div>

                            {loadingStatistics ? (

                                <div className="text-center py-5">

                                    <div
                                        className="spinner-border"
                                        role="status"
                                    />

                                    <p className="text-muted mt-3">
                                        Loading statistics...
                                    </p>

                                </div>

                            ) : statistics ? (

                                <>

                                    {/* =========================================
                                        TOTAL CONFIRMED
                                        ========================================= */}

                                    <div className="row g-4 mb-4">

                                        <div className="col-md-6 col-lg-4">

                                            <div className="card shadow-sm h-100">

                                                <div className="card-body">

                                                    <h6 className="text-muted">
                                                        CONFIRMED ATTENDEES
                                                    </h6>

                                                    <h1 className="display-4 fw-bold mb-0">
                                                        {
                                                            statistics.total_confirmed
                                                        }
                                                    </h1>

                                                    <p className="text-muted mb-0">
                                                        People confirmed to attend
                                                    </p>

                                                </div>

                                            </div>

                                        </div>

                                        <div className="col-md-6 col-lg-4">

                                            <div className="card shadow-sm h-100">

                                                <div className="card-body">

                                                    <h6 className="text-muted">
                                                        MLH EMAIL OPT-INS
                                                    </h6>

                                                    <h1 className="display-4 fw-bold mb-0">
                                                        {
                                                            statistics
                                                                .email_opt_ins
                                                                .mlh
                                                        }
                                                    </h1>

                                                    <p className="text-muted mb-0">
                                                        Confirmed attendees
                                                    </p>

                                                </div>

                                            </div>

                                        </div>

                                        <div className="col-md-6 col-lg-4">

                                            <div className="card shadow-sm h-100">

                                                <div className="card-body">

                                                    <h6 className="text-muted">
                                                        SPONSOR EMAIL OPT-INS
                                                    </h6>

                                                    <h1 className="display-4 fw-bold mb-0">
                                                        {
                                                            statistics
                                                                .email_opt_ins
                                                                .sponsors
                                                        }
                                                    </h1>

                                                    <p className="text-muted mb-0">
                                                        Confirmed attendees
                                                    </p>

                                                </div>

                                            </div>

                                        </div>

                                    </div>

                                    {/* =========================================
                                        BREAKDOWNS
                                        ========================================= */}

                                    <div className="row g-4">

                                        {/* SHIRT SIZES */}

                                        <div className="col-lg-4">

                                            <div className="card shadow-sm h-100">

                                                <div className="card-header">

                                                    <h4 className="h5 mb-0">
                                                        👕 Shirt Sizes
                                                    </h4>

                                                </div>

                                                <div className="card-body">

                                                    {Object.entries(
                                                        statistics.shirt_sizes
                                                    ).map(
                                                        (
                                                            [
                                                                size,
                                                                count,
                                                            ]
                                                        ) => (

                                                            <div
                                                                key={
                                                                    size
                                                                }
                                                                className="d-flex justify-content-between align-items-center border-bottom py-2"
                                                            >

                                                                <span>
                                                                    {
                                                                        size
                                                                    }
                                                                </span>

                                                                <span className="badge bg-primary rounded-pill">
                                                                    {
                                                                        count
                                                                    }
                                                                </span>

                                                            </div>

                                                        )
                                                    )}

                                                </div>

                                            </div>

                                        </div>

                                        {/* GENDER */}

                                        <div className="col-lg-4">

                                            <div className="card shadow-sm h-100">

                                                <div className="card-header">

                                                    <h4 className="h5 mb-0">
                                                        ⚧ Gender
                                                    </h4>

                                                </div>

                                                <div className="card-body">

                                                    {Object.entries(
                                                        statistics.gender
                                                    ).map(
                                                        (
                                                            [
                                                                gender,
                                                                count,
                                                            ]
                                                        ) => (

                                                            <div
                                                                key={
                                                                    gender
                                                                }
                                                                className="d-flex justify-content-between align-items-center border-bottom py-2"
                                                            >

                                                                <span>
                                                                    {
                                                                        gender
                                                                    }
                                                                </span>

                                                                <span className="badge bg-primary rounded-pill">
                                                                    {
                                                                        count
                                                                    }
                                                                </span>

                                                            </div>

                                                        )
                                                    )}

                                                </div>

                                            </div>

                                        </div>

                                        {/* ETHNICITY */}

                                        <div className="col-lg-4">

                                            <div className="card shadow-sm h-100">

                                                <div className="card-header">

                                                    <h4 className="h5 mb-0">
                                                        🌍 Ethnicity
                                                    </h4>

                                                </div>

                                                <div className="card-body">

                                                    {Object.entries(
                                                        statistics.ethnicity
                                                    ).map(
                                                        (
                                                            [
                                                                ethnicity,
                                                                count,
                                                            ]
                                                        ) => (

                                                            <div
                                                                key={
                                                                    ethnicity
                                                                }
                                                                className="d-flex justify-content-between align-items-center border-bottom py-2"
                                                            >

                                                                <span>
                                                                    {
                                                                        ethnicity
                                                                    }
                                                                </span>

                                                                <span className="badge bg-primary rounded-pill">
                                                                    {
                                                                        count
                                                                    }
                                                                </span>

                                                            </div>

                                                        )
                                                    )}

                                                </div>

                                            </div>

                                        </div>

                                    </div>

                                    {/* =========================================
                                        EMAIL EXPORTS
                                        ========================================= */}

                                    <div className="card shadow-sm mt-4">

                                        <div className="card-header">

                                            <h4 className="h5 mb-0">
                                                📧 Email Exports
                                            </h4>

                                        </div>

                                        <div className="card-body">

                                            <p className="text-muted">
                                                Export the email addresses of
                                                confirmed attendees who have
                                                opted into each mailing list.
                                            </p>

                                            <div className="row g-3">

                                                <div className="col-md-6">

                                                    <div className="border rounded p-3">

                                                        <h5>
                                                            MLH Emails
                                                        </h5>

                                                        <p className="text-muted">
                                                            {
                                                                statistics
                                                                    .email_opt_ins
                                                                    .mlh
                                                            }{" "}
                                                            confirmed attendees
                                                        </p>

                                                        <a
                                                            href={`${API_URL}/api/admin/export/mlh-emails`}
                                                            className="btn btn-primary"
                                                        >
                                                            📥 Export MLH Emails
                                                        </a>

                                                    </div>

                                                </div>

                                                <div className="col-md-6">

                                                    <div className="border rounded p-3">

                                                        <h5>
                                                            Sponsor Emails
                                                        </h5>

                                                        <p className="text-muted">
                                                            {
                                                                statistics
                                                                    .email_opt_ins
                                                                    .sponsors
                                                            }{" "}
                                                            confirmed attendees
                                                        </p>

                                                        <a
                                                            href={`${API_URL}/api/admin/export/sponsor-emails`}
                                                            className="btn btn-success"
                                                        >
                                                            📥 Export Sponsor Emails
                                                        </a>

                                                    </div>

                                                </div>

                                            </div>

                                        </div>

                                    </div>

                                </>

                            ) : (

                                <div className="alert alert-info">
                                    No statistics available.
                                </div>

                            )}

                        </div>

                    </div>

                </div>

            </div>

            {/* =========================================================
               TEAM ASSIGNMENT SUCCESS MODAL
               ========================================================= */}

            {showTeamSuccess && (

                <div
                    className="modal fade show d-block"
                    tabIndex={-1}
                    role="dialog"
                    style={{
                        backgroundColor:
                            "rgba(0, 0, 0, 0.5)",
                    }}
                >

                    <div
                        className="modal-dialog modal-dialog-centered"
                        role="document"
                    >

                        <div className="modal-content">

                            <div className="modal-header">

                                <h5 className="modal-title">
                                    Teams Assigned Successfully
                                </h5>

                            </div>

                            <div className="modal-body text-center py-4">

                                <div
                                    className="rounded-circle bg-success text-white d-flex align-items-center justify-content-center mx-auto mb-3"
                                    style={{
                                        width: "65px",
                                        height: "65px",
                                        fontSize: "32px",
                                    }}
                                >
                                    ✓
                                </div>

                                <h4 className="mb-3">
                                    Team assignment complete!
                                </h4>

                                <p className="text-muted mb-2">
                                    All registered participants
                                    have been assigned to teams.
                                </p>

                                <p className="mb-0">

                                    <strong>
                                        {numberOfTeams}
                                    </strong>{" "}

                                    team
                                    {numberOfTeams !== 1
                                        ? "s"
                                        : ""}{" "}
                                    created.

                                </p>

                            </div>

                            <div className="modal-footer justify-content-center">

                                <button
                                    type="button"
                                    className="btn btn-success px-4"
                                    onClick={() =>
                                        setShowTeamSuccess(
                                            false
                                        )
                                    }
                                >
                                    Done
                                </button>

                            </div>

                        </div>

                    </div>

                </div>

            )}

        </div>
    );
}

export default Admin;