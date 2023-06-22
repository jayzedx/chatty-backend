import { UploadApiResponse } from 'cloudinary';
import { ObjectId } from 'mongodb';
import { Request, Response } from 'express';
import { joiValidation } from '@global/decorators/joi-validation.decorators';
import { signupSchema } from '@auth/schemes/signup';
import { IAuthDocument, ISignUpData } from '@auth/interfaces/auth.interface';
import { authService } from '@service/db/auth.service';
import { BadRequestError } from '@global/helpers/error-handlers';
import { Helpers } from '@global/helpers/helpers';
import { upload } from '@global/helpers/cloudinary-upload';

export class SignUp {
  @joiValidation(signupSchema)
  public async create(req: Request, res:Response): Promise<void> {
    const { username, email, password, avatarColor, avatarImage } = req.body;
    const checkIfUserExist: IAuthDocument = await authService.getUserByUsernameOrEmail(username, email);
    if (checkIfUserExist) {
      throw new BadRequestError('Invalid credentitials');
    }

    const authObjectId: ObjectId = new ObjectId();
    const userObjectId: ObjectId = new ObjectId();
    const uId = `${Helpers.generateRandomIntegers(12)}`;
    const authData: IAuthDocument = SignUp.prototype.signupData({
      _id: authObjectId,
      uId,
      username,
      password,
      email,
      avatarColor
    });

    const result: UploadApiResponse = await upload(avatarImage, `${userObjectId}`, true, true) as UploadApiResponse;
    // https://res.cloudinary.com/123/userObjectId
    if (!result?.public_id) {
      throw new BadRequestError('File upload: Error occured. Try again.');
    }

  }

  private signupData(data: ISignUpData): IAuthDocument {
    const { _id, username, password, email, uId, avatarColor } = data;
    return {
      _id,
      uId,
      username: Helpers.firstLetterUpperCase(username),
      password,
      email: Helpers.lowerCase(email),
      avatarColor,
      createdAt: new Date()
    } as IAuthDocument;
  }
}
