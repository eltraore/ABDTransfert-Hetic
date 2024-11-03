export const user_schema = {
    username: {
        exists: true,
        notEmpty: true,
        escape: true
    },
    password: {
        exists: true
    }
}