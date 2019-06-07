import CognitoExpress from 'cognito-express'
import { init, destroy, authentication } from "../src"

jest.mock('cognito-express')

describe('middleware', () => {
    const spy = jest.fn();

    beforeEach(() => {
        destroy()
    })

    describe('init', () => {
        it('should thrown an error in case of missing awsRegion parameter', () => {
            expect(() => init()).toThrow('missing mandatory awsRegion parameter')
        })
        it('should thrown an error in case of missing cognitoUserPoolId parameter', () => {
            expect(() => init('cognitoUserPoolId')).toThrow('missing mandatory cognitoUserPoolId parameter')
        })
        it('should create an instance of cognito express', () => {
            CognitoExpress.mockImplementation(spy)
            init('awsRegion', 'cognitoUserPoolId')
            expect(spy).toBeCalledWith({
                region: 'awsRegion',
                cognitoUserPoolId: 'cognitoUserPoolId',
                tokenUse: "access",
                tokenExpiration: 3600000
            })
        })
    })
    describe('authentication', () => {
        it('should reject in case of missing initialization', async () => {
            await authentication({ headers: {} }, {}, spy)
            expect(spy).toBeCalledWith('CognitoNotInitializedError')
        })

        it('should reject in case of missing token', async () => {
            init('awsRegion', 'cognitoUserPoolId')
            await authentication({ headers: {} }, {}, spy)
            expect(spy).toBeCalledWith('TokenMissingError')
        })

        it('should reject in case of empty token', async () => {
            init('awsRegion', 'cognitoUserPoolId')
            await authentication({ headers: { authorization: '' } }, {}, spy)
            expect(spy).toBeCalledWith('TokenMissingError')
        })
        it('should call validate with accessToken and return the user', async () => {
            CognitoExpress.mockImplementation(() => ({
                validate: (token) => {
                    expect(token).toEqual('token')
                    return new Promise((resolve, reject) => resolve({
                        username: 'foo'
                    }))
                }
            }))
            init('awsRegion', 'cognitoUserPoolId')
            let req = await authentication({ headers: { authorization: 'token' } }, {}, spy)
            expect(req.user).toEqual({ username: 'foo' })
        })
        it('should reject in case of validation error', async () => {
            CognitoExpress.mockImplementation(() => ({
                validate: (token) => {
                    expect(token).toEqual('token')
                    return new Promise((resolve, reject) => reject(new Error('something wrong')))
                }
            }))
            init('awsRegion', 'cognitoUserPoolId')
            await authentication({ headers: { authorization: 'token' } }, {}, spy)

            expect(spy).toBeCalledWith('CognitoValidationError')
        })
    })
})