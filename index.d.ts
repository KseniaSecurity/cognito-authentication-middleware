declare namespace Express {
    export interface Request {
        user: { username: string }
    }
}

export default (awsRegion: string, cognitoUserPoolId: string) => (req: Request, res: Response, next: any) => Void