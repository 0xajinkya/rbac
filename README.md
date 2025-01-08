# RBAC

This project is a robust platform built with Prisma ORM and Node.js, designed to manage organizational structures, user roles, and resources using **Role-Based Access Control (RBAC)**. It supports multi-tenancy with organizations as the central unit and allows staff members to have specific roles with defined scopes and permissions. Key features include blog and comment management, dynamic role and permission handling, user authentication, and authorization workflows. The platform ensures secure access by enforcing role-based constraints while facilitating seamless collaboration within organizations.

## **Table of Contents**

1.  [Overview](#overview)
2.  [Features](#features)
3.  [Setup Instructions](#setup-instructions)
4.  [API Endpoints](#api-endpoints)
5.  [Database Design](#database-design)

## Overview

This project is a multi-tenant platform designed to manage organizations, users, and their respective roles and permissions using **Role-Based Access Control (RBAC)**. The system provides a robust backend infrastructure built with **Prisma ORM** and **Node.js**, focusing on modularity, security, and ease of integration.

## Features

1.  **RBAC (Role-Based Access Control):**
    
    -   Roles and permissions are dynamically managed to control access to resources.
    -   Fine-grained scopes ensure secure and appropriate user actions.
2.  **Organization Management:**
    
    -   Multi-tenancy support for managing organizations and their associated users.
    -   Admin roles can assign users to specific roles within an organization.
3.  **Staff and Role Management:**
    
    -   Create, assign, and validate roles such as `super_admin`, `admin`, and others.
    -   Staff members are associated with organizations and roles, enforcing permissions.
4.  **Content Management System:**
    
    -   Features for creating, updating, publishing, and managing blogs and their comments.
    -   Role-based access to content management operations.
5.  **Authentication and Authorization:**
    
    -   Token-based authentication with secure session handling.
    -   Middleware for enforcing permissions and organization-specific access.
6.  **Dynamic Scopes and Permissions:**
    
    -   Permissions are defined at the role level, enabling modular control of actions and resources.
7.  **Transactional Operations:**
    
    -   All operations are transaction-safe to ensure data integrity during complex workflows.

This platform is ideal for use cases requiring secure role management, such as enterprise systems, content platforms, and team collaboration tools. The use of RBAC ensures that access is strictly controlled based on user roles, fostering security and compliance.



## Setup Instructions

### Setting Up the Project Locally

Follow these steps to set up the project and run it locally:

1.  **Update Environment Variables**
    
    -   Ensure all required environment variables are configured in the `.env` file.
    -   These typically include database connection strings, authentication secrets, and other key configurations.
2. **Start PostgreSQL**
	-   Run the command:
		    -   `bun startall`
3. **Run Database Migrations**
	-   Apply all necessary migrations to set up the database schema:
		    -   `bun db:migrate dev`
4. **Generate Prisma Client**
	-   Generate the Prisma Client to interact with the database:
		    -   `bun db:generate`
5. **Start the Development Server**
	-   Run the development server:
		    -   `bun dev`

### Running Tests Locally
1. **This does everything**
	-   Run the command:
		    -   `bun run test`

## API Endpoints

The project includes a comprehensive set of API endpoints to interact with the system's features, including user management, organization management, RBAC (role-based access control), and more.

For detailed documentation and usage examples, refer to the Postman API Documentation:  
👉 [View API Documentation](https://documenter.getpostman.com/view/27359911/2sAYBXBWUG)

This documentation provides:

-   **Endpoint Details**: Full list of available endpoints.
-   **Request/Response Formats**: Examples of payloads and responses.
-   **Authentication Requirements**: Information on securing your API calls.
-   **Error Codes**: Common error responses and troubleshooting tips.


## Database Design

The database for this project is designed to manage users, organizations, roles, blogs, comments, and reviews while adhering to principles of relational database modeling. It is implemented using **PostgreSQL** with the Prisma ORM. The design enables fine-grained **Role-Based Access Control (RBAC)**, hierarchical associations, and a flexible relationship structure.

----------

#### **Key Models and Relationships**

1.  **User**
    
    -   Represents individuals interacting with the system.
    -   Attributes include `id`, `email`, `password`, and timestamps for auditing.
    -   Relationships:
        -   A user can belong to multiple organizations via the `organization` model.
        -   Linked to multiple roles in organizations via the `staff` table.
        -   Can comment on blogs via the `blog_comment` model.
2.  **Organization**
    
    -   Represents entities or groups managed within the system.
    -   Attributes include `id`, `name`, and metadata for creation and updates.
    -   Relationships:
        -   Created by a `user` (one-to-one relationship with the `created_by` user).
        -   Contains many `staff` members and `blogs`.
3.  **Staff**
    
    -   Bridges the relationship between `user`, `organization`, and `role`.
    -   Attributes include `id`, `role_id`, `user_id`, and timestamps.
    -   Relationships:
        -   A staff record ties a user to an organization with a specific role.
        -   Staff can create blogs and reviews.
4.  **Role**
    
    -   Defines the scope and permissions within an organization.
    -   Attributes include `id` and `name` (e.g., "admin", "editor").
    -   Relationships:
        -   Linked to multiple `staff` records to implement RBAC.
5.  **Blog**
    
    -   Represents articles or content created within an organization.
    -   Attributes include `id`, `title`, `content`, and a `published` flag.
    -   Relationships:
        -   Created by a `staff` member and associated with an organization.
        -   Can have multiple comments (`blog_comment`) and reviews (`blog_review`).
6.  **Blog Comment**
    
    -   Represents comments made on blogs by users.
    -   Attributes include `id`, `comment`, and metadata.
    -   Relationships:
        -   Associated with a single `blog`.
        -   Created by a `user`.
7.  **Blog Review**
    
    -   Represents reviews on blogs, typically by staff members.
    -   Attributes include `id`, `review`, and timestamps.
    -   Relationships:
        -   Linked to a specific `blog`.
        -   Created by a `staff` member.

----------

#### **Highlights of Database Design**

-   **RBAC Implementation**: The `role` and `staff` tables together enforce role-based permissions, ensuring secure access control to resources.
-   **Cascading Relationships**: Relations are defined with cascading deletes, ensuring data integrity. For example, deleting an organization removes its blogs and associated comments/reviews.
-   **Auditing Support**: `created_at` and `updated_at` fields are present across models for tracking changes.
-   **Soft Deletes**: The `deleted` field allows logical deletion of records without permanently removing them from the database.

----------

### Schema Diagram (Simplified)

```[user]
  └─<organization>─<staff>─<role>
  └─<blog_comment>──[blog]──<blog_review>
                      └───────[staff]
```
-   **Users** can belong to multiple organizations.
-   **Organizations** are linked to users via the `created_by` field and have many staff members and blogs.
-   **Blogs** are associated with organizations, and they can have comments and reviews from users and staff, respectively.
-   **RBAC** is implemented using the `staff` and `role` models.
