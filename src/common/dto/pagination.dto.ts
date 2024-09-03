import { Type } from "class-transformer";
import { IsInt, IsOptional, IsPositive } from "class-validator";

export class PaginationDto {

    @IsInt()
    @IsPositive()
    @IsOptional()
    @Type(() => Number)
    limit?: number;

    @IsInt()
    @IsPositive()
    @IsOptional()
    @Type(() => Number)
    offset?: number;
}