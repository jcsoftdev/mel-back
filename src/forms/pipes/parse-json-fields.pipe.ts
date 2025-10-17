import {
  Injectable,
  PipeTransform,
  BadRequestException,
  ArgumentMetadata,
} from '@nestjs/common';

@Injectable()
export class ParseJsonFieldsPipe implements PipeTransform {
  transform(value: unknown, metadata: ArgumentMetadata): unknown {
    if (metadata.type !== 'body' || !value) {
      return value;
    }

    const body = value as Record<string, unknown>;

    // If fields exist and is a string, parse it
    if (body.fields && typeof body.fields === 'string') {
      try {
        body.fields = JSON.parse(body.fields);
      } catch {
        throw new BadRequestException(
          'Fields must be a valid JSON array when sent as multipart/form-data',
        );
      }
    }

    return body;
  }
}
