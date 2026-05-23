# AI Collaboration & Development Documentation

## 1. Overview

This project was developed using a hybrid workflow combining manual coding with AI assistance. I utilized **Gemini** for architectural guidance, debugging complex logic, and troubleshooting, and **Cursor** as the primary IDE for code implementation and project structure management.

---

## 2. AI Tools & Models Used

- **Gemini:** Used for algorithmic problem-solving (e.g., mention parsing), architectural advice, and debugging test lifecycle issues (E2E stability).
- **Cursor:** Used for generating module skeletons and managing the project's codebase context.

---

## 3. Workflow Process

1.  **Requirement Analysis:** Breaking down the `README.md` requirements into logical tasks.
2.  **Implementation:** Generating boilerplate, DTOs, and Service logic via **Cursor**.
3.  **Code Review:** Manually reviewing and validating all AI-generated code to ensure architectural consistency, type safety, and adherence to business logic.
4.  **Debugging & Testing:** Utilizing **Gemini** to analyze stack traces and resolve integration issues.

---

## 4. Key Implementation Highlights

### Authentication & Security

- **Strategy:** Implemented JWT-based authentication with `JwtAuthGuard` and role-based access control (RBAC) using custom decorators.
- **Security:** Integrated `ClassSerializerInterceptor` to prevent sensitive data (passwords) from being exposed in API responses.

### E2E Testing & Debugging

- **Challenge:** Encountered `401 Unauthorized` and `SQLITE_CONSTRAINT` errors during E2E test execution.
- **Resolution:** Identified that the test environment lifecycle was missing necessary data seeding. Implemented a `beforeAll` setup routine to inject mock users and projects, ensuring test isolation and reliability.
- **Debugging History:** [Full Interaction History](https://gemini.google.com/share/7dc7c21372a9)

### Comments & Mentions Logic

- **Implementation:** Developed a regex-based helper (`parse-mentions.helper.ts`) to extract `@username` patterns.
- **Integration:** Created a `Many-to-Many` relation between `Comment` and `User` via a join table, and implemented a service layer that validates user existence before finalizing mentions.

---

## 5. Relevant Files & Modules

| Module       | Location                   | Role                                                   |
| :----------- | :------------------------- | :----------------------------------------------------- |
| **Auth**     | `src/auth/`                | JWT, Guards, and RBAC implementation.                  |
| **Tickets**  | `src/tickets/`             | CRUD, File export/import (CSV), and soft-delete logic. |
| **Comments** | `src/comments/`            | Commenting system with `@mention` parsing logic.       |
| **Testing**  | `test/tickets.e2e-spec.ts` | E2E test suite with automated data seeding.            |

---

## 6. Development Integrity

I maintained full ownership of the codebase by verifying that all AI-suggested code matched the project's requirements. This included:

- Resolving circular dependencies using `forwardRef`.
- Ensuring `class-validator` and `TypeORM` decorators were applied correctly across all new entities.
- Aligning API endpoints with the specific requirements listed in the `README.md`.
