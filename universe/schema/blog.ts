export const BlogSchema = {
  title: 'required|max:32',
  content: 'required|max:1024',
  organization_id: 'required|max:20',
  created_by_staff_id: 'required|max:20',
  published: 'boolean',
  deleted: 'boolean',
  created_at: 'date',
  updated_at: 'date',
};

export const UpdateBlogSchema = {
    title: 'max:32',
    content: 'max:1024',
    published: 'boolean',
    deleted: 'boolean',
};  

export const CommentSchema = {
    comment: 'required|max:1024',
    blog_id: 'required|max:20',
    created_by_user_id: 'required|max:20',
    deleted: 'boolean',
    created_at: 'date',
    updated_at: 'date',
};

export const ReviewSchema = {
  review: 'required|max:1024',
  blog_id: 'required|max:20',
  created_by_staff_id: 'required|max:20',
  deleted: 'boolean',
  created_at: 'date',
  updated_at: 'date',
};