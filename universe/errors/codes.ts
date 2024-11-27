export const codes: Record<(typeof ErrorCodesList)[number], string> = {
    CredentialsExpired:
        'Your credentials have expired. Please reset your password and sign in again.',
    NotAllowedAccess:
        "You're not authorized. Please contact your organization's Admin.",
    EmptyInput: 'Please provide some input.',
    InvalidInput: 'Please provide valid inputs.',
    SomethingWentWrong: 'Something unexpected happened.',
    NotFound: 'Not found.',
    AccountExists: 'Account already exists',
    AccountNotFound: 'Account not found.',
    EmailInvalid: 'Email address is invalid.',
    InvalidCredentials: 'The credentials you entered are invalid.',
    NeedSignin: 'Please sign in.',
    ResourceExists: '{resource} already exists.',
    ResourceNotFound: '{resource} not found.',
    ResourceExpired: '{resource} has expired.',
    CustomMessage: '{message}',
    RefreshAgain: "Refresh again"
};

export const ErrorCodesList = [
    'CredentialsExpired',
    'NotAllowedAccess',
    'EmptyInput',
    'InvalidInput',
    'SomethingWentWrong',
    'NotFound',
    'AccountExists',
    'AccountNotFound',
    'EmailInvalid',
    'InvalidCredentials',
    'NeedSignin',
    'ResourceExists',
    'ResourceNotFound',
    'ResourceExpired',
    'CustomMessage',
    'RefreshAgain'
] as const;