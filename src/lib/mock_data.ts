export const mockSchemes = [
    {
        id: "scheme-1",
        title: "Prime Minister's Employment Generation Programme (PMEGP)",
        description: "Credit-linked subsidy scheme for setting up new micro-enterprises.",
        eligibility: {
            is_eligible: true,
            reasoning: "User meets the age requirement of 18-35 and income is below 5L.",
            citations: [
                {
                    source: "PMEGP_Guidelines.pdf",
                    page: 14,
                    text: "Applicant age is above 18 and income is below the eligibility threshold."
                }
            ],
            checklist: [
                { item: "Valid Aadhaar Card", status: "verified" },
                { item: "Income Certificate", status: "pending" }
            ]
        }
    },
    {
        id: "scheme-2",
        title: "Startup India Seed Fund Scheme",
        description: "Financial assistance to startups for proof of concept, prototype development, market entry.",
        eligibility: {
            is_eligible: false,
            reasoning: "Business must be incorporated for less than 2 years. User indicated planning stage.",
            citations: [
                {
                    source: "Startup_India_Manual.pdf",
                    page: 12,
                    text: "Eligibility: 18-35 years, entity incorporated within last 2 years."
                }
            ],
            checklist: []
        }
    }
];

export const mockActivities = [
    {
        id: "act-1",
        type: "business",
        status: "ongoing",
        title: "Cafe Setup Roadmap",
        progress: 33,
        tasks: [
            { name: "Register business name", completed: true },
            { name: "Apply for GST registration", completed: true },
            { name: "Obtain food safety license (FSSAI)", completed: false },
            { name: "Obtain fire safety clearance", completed: false },
            { name: "Apply for local municipality permit", completed: false },
            { name: "Register for labour compliance", completed: false }
        ]
    },
    {
        id: "act-2",
        type: "scheme",
        status: "ongoing",
        title: "PMEGP Application",
        progress: 80,
        tasks: [
            { name: "Verify eligibility", completed: true },
            { name: "Gather required documents", completed: true },
            { name: "Submit online application", completed: true },
            { name: "Track approval status", completed: false }
        ]
    }
];

export const mockUserLocation = "Salem, Ward 4";

export const mockComplaints = [
    {
        id: "comp-1",
        description: "Large pothole near school entrance.",
        department: "Public Works Department",
        priority_score: 8,
        status: "In Progress",
        verification_count: 5,
        timestamp: "2023-10-27T10:00:00Z",
        location: "Salem, Ward 4",
        distance: "200m away"
    },
    {
        id: "comp-2",
        description: "Sparking transformer near Main St.",
        department: "Electricity Board",
        priority_score: 9.5,
        status: "Pending",
        verification_count: 12,
        timestamp: "2023-10-27T08:30:00Z",
        location: "Salem, Ward 4",
        distance: "1.2km away"
    },
    {
        id: "comp-3",
        description: "Garbage overflow at central park.",
        department: "Municipal Sanitation",
        priority_score: 4,
        status: "Resolved",
        verification_count: 2,
        timestamp: "2023-10-26T14:15:00Z",
        location: "Chennai, Zone East",
        distance: "340km away"
    }
];

export const mockAdminStats = {
    critical_issues: 24,
    verified_issues: 156,
    resolved_today: 42
};
