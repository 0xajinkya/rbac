export const OrganizationSchema = {
    name: 'required|max:32',
    created_by_id: 'required|max:20',
    deleted: 'boolean',
    created_at: 'date',
    updated_at: 'date',
};

export const StaffSchema = {
    user_id: 'required|max:20',
    organization_id: 'required|max:20',
    role_id: 'required|max:20',
    deleted: 'boolean',
    created_at: 'date',
    updated_at: 'date',
};