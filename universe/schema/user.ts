import Validator from "validatorjs";

Validator.register(
    'complex_password',
    (value) => {
        if (typeof value !== 'string') {
            return false; // Reject non-string values
        }
        const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
        return regex.test(value);
    },
    'The password must be at least 8 characters long and include at least one uppercase letter, one lowercase letter, one number, and one special character.'
);

export const UserSchema = {
    email: 'required|email',
    password: 'required|complex_password',
    first_name: 'max:50',
    last_name: 'max:50',
};
