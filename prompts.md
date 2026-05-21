I am working on the IssueFlow project (NestJS 11). I need to start with the 'Users' module. Based on the requirements, please generate the code for:

    The User entity (src/users/entities/user.entity.ts). Use TypeORM decorators. The user must have: id, username, email, fullName, and role (enum: ADMIN or DEVELOPER).

    The CreateUserDto (src/users/dto/create-user.dto.ts) with appropriate class-validator decorators.

    Please explain where to put these files and what's the next step

    הטמעתי את ה-UsersService וה-UsersController תוך שימוש ב-Dependency Injection כדי לעבוד מול ה-User Entity
