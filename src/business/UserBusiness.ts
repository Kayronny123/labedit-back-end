import { UserDatabase } from "../database/UserDatabase";
import { SignupInputDTO, SignupOutputDTO } from "../dtos/user/signup.dto";
import { ConflictError } from "../errors/ConflictError";
import { TokenPayload, User } from "../models/User";
import { HashManager } from "../services/HashManager";
import { IdGenerator } from "../services/IdGenerator";
import { TokenManager } from "../services/TokenManager";

export class UserBusiness{
    constructor(
        private userDataBase: UserDatabase,
        private idGenerator: IdGenerator,
        private tokenManager: TokenManager,
        private hashManager: HashManager
        
    ){}
    public  signup = async (input: SignupInputDTO): Promise<SignupOutputDTO>=>{
    const {nickname, email, password} = input
    const isEmailExist = await this.userDataBase.findByEmail(email)
        if(isEmailExist){
            throw new ConflictError('Email já cadastrado')
        }
        const id = this.idGenerator.generate()
        const hashedPassword = await this.hashManager.hash(password)
        const user = new User(
            id,
            nickname,
            email,
            hashedPassword,
        )
            
        await this.userDataBase.insertUser(user.toDBModel())
            const payload: TokenPayload = {
                id: user.getId(),
                nickname: user.getNickname(),
            }
            const token = this.tokenManager.createToken(payload)

            const output:SignupOutputDTO = {
                token:token
            }
            return output
}
}