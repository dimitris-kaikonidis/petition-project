const supertest = require("supertest");
const cookieSession = require("cookie-session");
const { addSignatures } = require("./utilities/db");
jest.mock("./utilities/db");
const app = require("./server");

test("GET / redirects to /petition", () => supertest(app)
    .get("/")
    .then(res => {
        expect(res.statusCode).toBe(302);
        expect(res.header.location).toBe("/login");
    })
);

test("GET /login renders login hbs template if user is not logged in", () => supertest(app)
    .get("/login")
    .then(res => {
        expect(res.statusCode).toBe(200);
        expect(res.text).toContain("Don't have an account? Please sign up");
    })
);

test("GET /login redirects to petition if user is already logged in", () => {
    cookieSession.mockSessionOnce({
        user: {
            id: 12
        }
    });
    return supertest(app)
        .get("/login")
        .then(res => {
            expect(res.statusCode).toBe(302);
            expect(res.header.location).toBe("/petition");
        });
});

test("GET /petition redirects to login page if user is not logged in", () => {
    cookieSession.mockSessionOnce({});
    return supertest(app)
        .get("/petition")
        .then(res => {
            expect(res.statusCode).toBe(302);
            expect(res.header.location).toBe("/login");
        });
});

test("GET /login redirects to petition if user is logged in", () => {
    cookieSession.mockSessionOnce({
        user: {
            id: 12
        }
    });
    return supertest(app)
        .get("/login")
        .then(res => {
            expect(res.statusCode).toBe(302);
            expect(res.header.location).toBe("/petition");
        });
});

test("GET /register redirects to petition if user is logged in", () => {
    cookieSession.mockSessionOnce({
        user: {
            id: 12
        }
    });
    return supertest(app)
        .get("/register")
        .then(res => {
            expect(res.statusCode).toBe(302);
            expect(res.header.location).toBe("/petition");
        });
});

test("GET /petition redirects to thanks if user has signed", () => {
    cookieSession.mockSessionOnce({
        user: {
            id: 12,
            signature_id: 12
        }
    });
    return supertest(app)
        .get("/petition")
        .then(res => {
            expect(res.statusCode).toBe(302);
            expect(res.header.location).toBe("/thanks");
        });
});

test("GET /thanks redirects to petition if user has not signed", () => {
    cookieSession.mockSessionOnce({
        user: {
            id: 12,
            signature_id: ""
        }
    });
    return supertest(app)
        .get("/thanks")
        .then(res => {
            expect(res.statusCode).toBe(302);
            expect(res.header.location).toBe("/petition");
        });
});

test("GET /thanks redirects to petition if user has not signed", () => {
    cookieSession.mockSessionOnce({
        user: {
            id: 12,
            signature_id: ""
        }
    });
    return supertest(app)
        .get("/signers")
        .then(res => {
            expect(res.statusCode).toBe(302);
            expect(res.header.location).toBe("/petition");
        });
});

test("POST /petition redirects to thanks if signature ok", () => {
    cookieSession.mockSessionOnce({
        user: {
            id: 12
        }
    });
    addSignatures.mockResolvedValue({
        rows: [{
            id: 12
        }]
    });
    return supertest(app)
        .post("/petition")
        .then(res => {
            expect(res.statusCode).toBe(302);
            expect(res.header.location).toBe("/thanks");
        });
});

test("POST /petition redirects to petition if signature is not ok", () => {
    cookieSession.mockSessionOnce({
        user: {
            id: 12
        }
    });
    addSignatures.mockResolvedValue({});
    return supertest(app)
        .post("/petition")
        .then(res => {
            expect(res.statusCode).toBe(302);
            expect(res.header.location).toBe("/petition");
        });
});

