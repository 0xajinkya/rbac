import { BlogService } from "@services/blog";
import { Database } from "@universe/loaders/database";
import { Request, Response } from "express";

const Create = async (request: Request, response: Response) => {
    const {
        title,
        content
    } = request.body;
    const transaction = await Database.getTransaction();
    const blog = await BlogService.Create({
        title,
        content
    }, {
        transaction
    })
    return response.status(201).json({
        status: true,
        content: {
            data: blog
        }
    })
};

const Publish = async (request: Request, response: Response) => {
    const {
        id
    } = request.params;
    const transaction = await Database.getTransaction();
    const blog = await BlogService.Publish(id, {
        transaction
    })
    return response.status(201).json({
        status: true,
        content: {
            data: blog
        }
    })
};

const UnPublish = async (request: Request, response: Response) => {
    const {
        id
    } = request.params;
    const transaction = await Database.getTransaction();
    const blog = await BlogService.UnPublish(id, {
        transaction
    })
    return response.status(201).json({
        status: true,
        content: {
            data: blog
        }
    })
};

const Update = async (request: Request, response: Response) => {
    const {
        id
    } = request.params;
    const {
        content,
        title,
        published
    } = request.body;

    const transaction = await Database.getTransaction();
    const blog = await BlogService.Update(id, {
        content,
        title,
        published
    }, {
        transaction
    })
    return response.status(201).json({
        status: true,
        content: {
            data: blog
        }
    })
};

const Comment = async (request: Request, response: Response) => {
    const {
        id
    } = request.params;
    const {
        comment
    } = request.body;
    const transaction = await Database.getTransaction();
    const createdComment = await BlogService.Comment(id, {
        comment,
    }, {
        transaction
    })
    return response.status(201).json({
        status: true,
        content: {
            data: createdComment
        }
    })
};

const Review = async (request: Request, response: Response) => {
    const {
        id
    } = request.params;
    const {
        review
    } = request.body;
    const transaction = await Database.getTransaction();
    const createdReview = await BlogService.Review(id, {
        review,
    }, {
        transaction
    })
    return response.status(201).json({
        status: true,
        content: {
            data: createdReview
        }
    })
};


export const BlogController = {
    Create,
    Publish,
    UnPublish,
    Update,
    Comment,
    Review
}
