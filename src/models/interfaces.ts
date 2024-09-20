export interface APIError {
    code: string;
    message: string;
}

export interface APIResponse<T = any> {
    error: boolean,
    data: T,
    errors: APIError[] | null
}

export interface User {
    userID: string;
    username: string;
    displayName: string ;
    email: string;
    customStatus: string ;
    joinedAt: string;
    updatedAt: string;
    profilePictureURL: string;
}

export interface PublicUser {
    userID: string;
    username: string;
    displayName: string;
    profilePictureURL: string;
    customStatus: string;
    bio: string;
    joinedAt: string;
}

export interface Relationship {
    userID: string
    username: string
    displayName: string
    profilePictureURL: string
    status: string
}