import { scopes } from "@config/constants";
import { BlogController } from "@controllers/blog";
import { AuthHandlerMiddleware } from "@middlewares/auth-handler";
import { ScopeHandlerMiddleware } from "@middlewares/scope-handler";
import { Router } from "express";

export const BlogRouter = Router();

BlogRouter.post(
    "/",
    [
        AuthHandlerMiddleware(),
        ScopeHandlerMiddleware(scopes.blog.create)
    ],
    //@ts-ignore
    BlogController.Create
);

BlogRouter.post(
    "/query",
    //@ts-ignore
    BlogController.List
);

BlogRouter.get(
    "/:id",
    //@ts-ignore
    BlogController.Get
);

BlogRouter.put(
    "/:id/publish",
    [
        AuthHandlerMiddleware(),
        ScopeHandlerMiddleware(scopes.blog.publish)
    ],
    //@ts-ignore
    BlogController.Publish
);

BlogRouter.put(
    "/:id/un-publish",
    [
        AuthHandlerMiddleware(),
        ScopeHandlerMiddleware(scopes.blog.publish)
    ],
    //@ts-ignore
    BlogController.UnPublish
);

BlogRouter.put(
    "/:id/update",
    [
        AuthHandlerMiddleware(),
        ScopeHandlerMiddleware(scopes.blog.publish)
    ],
    //@ts-ignore
    BlogController.Update
);

BlogRouter.delete(
    "/:id/delete",
    [
        AuthHandlerMiddleware(),
        ScopeHandlerMiddleware(scopes.blog.publish)
    ],
    //@ts-ignore
    BlogController.Delete
);

BlogRouter.post(
    "/:id/comment",
    [
        AuthHandlerMiddleware(),
        // ScopeHandlerMiddleware(scopes.blog.comment)
    ],
    //@ts-ignore
    BlogController.Comment
);

BlogRouter.post(
    "/:id/review",
    [
        AuthHandlerMiddleware(),
        ScopeHandlerMiddleware(scopes.blog.review)
    ],
    //@ts-ignore
    BlogController.Review
);