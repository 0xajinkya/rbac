import { BlogService } from "@services/blog";
import { Database } from "@universe/loaders/database";
import { Request, Response } from "express";

const Create = async (request: Request, response: Response) => {
    const {
        title,
        content,
        published
    } = request.body;
    const transaction = await Database.getTransaction();
    const blog = await BlogService.Create({
        title,
        content,
    }, {
        transaction,
        published: published ?? false
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


const Delete = async (request: Request, response: Response) => {
    const {
        id
    } = request.params;
    const transaction = await Database.getTransaction();
    const blog = await BlogService.Delete(id, {
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

const List = async (request: Request, response: Response) => {
    const {
        where,
        include,
        order,
        limit,
        skip
    } = request.body;
    const blogs = await BlogService.List({
        where,
        include,
        order,
        limit,
        skip
    });
    return response.status(200).json({
        staus: true,
        content: {
            data: blogs
        }
    })
}

const Get = async (request: Request, response: Response) => {
    const {
        id
    } = request.params;
    const blog = await BlogService.Get(id);
    return response.status(200).json({
        staus: true,
        content: {
            data: blog
        }
    })
}

export const BlogController = {
    /**
     * Creates a new blog post with the provided title and content.
     * 
     * @function Create
     * @async
     * @param {Request} request - The request object containing the blog data in the body.
     * @param {Response} response - The response object to send the result back to the client.
     * @returns {Response} - A JSON response with the created blog data.
     * 
     * @throws {PlatformError} - Throws an error if creation fails.
    */
    Create,
    /**
     * Publishes a blog post by its ID.
     * 
     * @function Publish
     * @async
     * @param {Request} request - The request object containing the blog ID in the params.
     * @param {Response} response - The response object to send the result back to the client.
     * @returns {Response} - A JSON response with the published blog data.
     * 
     * @throws {PlatformError} - Throws an error if publication fails.
    */
    Publish,

    /**
     * Unpublishes a blog post by its ID.
     * 
     * @function UnPublish
     * @async
     * @param {Request} request - The request object containing the blog ID in the params.
     * @param {Response} response - The response object to send the result back to the client.
     * @returns {Response} - A JSON response with the unpublished blog data.
     * 
     * @throws {PlatformError} - Throws an error if unpublishing fails.
    */
    UnPublish,
    /**
     * Updates a blog post with the new content, title, and published status.
     * 
     * @function Update
     * @async
     * @param {Request} request - The request object containing the blog ID in the params and updated data in the body.
     * @param {Response} response - The response object to send the result back to the client.
     * @returns {Response} - A JSON response with the updated blog data.
     * 
     * @throws {PlatformError} - Throws an error if update fails.
    */
    Update,
    /**
     * Adds a comment to a blog post by its ID.
     * 
     * @function Comment
     * @async
     * @param {Request} request - The request object containing the blog ID in the params and comment data in the body.
     * @param {Response} response - The response object to send the result back to the client.
     * @returns {Response} - A JSON response with the created comment data.
     * 
     * @throws {PlatformError} - Throws an error if comment creation fails.
    */
    Comment,
    /**
     * Adds a review to a blog post by its ID.
     * 
     * @function Review
     * @async
     * @param {Request} request - The request object containing the blog ID in the params and review data in the body.
     * @param {Response} response - The response object to send the result back to the client.
     * @returns {Response} - A JSON response with the created review data.
     * 
     * @throws {PlatformError} - Throws an error if review creation fails.
    */
    Review,
    /**
     * Lists all blog posts with optional filters and pagination.
     * 
     * @function List
     * @async
     * @param {Request} request - The request object containing filters, sorting, and pagination options in the body.
     * @param {Response} response - The response object to send the result back to the client.
     * @returns {Response} - A JSON response with the list of blog posts.
     * 
     * @throws {PlatformError} - Throws an error if fetching the list fails.
    */
    List,
    /**
     * Retrieves a single blog post by its ID.
     * 
     * @function Get
     * @async
     * @param {Request} request - The request object containing the blog ID in the params.
     * @param {Response} response - The response object to send the result back to the client.
     * @returns {Response} - A JSON response with the blog data.
     * 
     * @throws {PlatformError} - Throws an error if the blog is not found.
    */
    Get,
    /**
     * Deletes a blog post by its ID.
     * 
     * @function Delete
     * @async
     * @param {Request} request - The request object containing the blog ID in the params.
     * @param {Response} response - The response object to send the result back to the client.
     * @returns {Response} - A JSON response indicating the success of the deletion.
     * 
     * @throws {PlatformError} - Throws an error if the blog deletion fails or if the blog is not found.
     */
    Delete
}
