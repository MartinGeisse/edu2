import {GetBackendCourseListResponse} from "../../../common/author-api/GetBackendCourseListResponse";
import {backendGet, backendPost} from "./backendCall";
import {GetBackendCourseAndUnitsResponse} from "../../../common/author-api/GetBackendCourseAndUnitsResponse";
import {UpdateCourseHeaderDataRequest} from "../../../common/author-api/UpdateCourseHeaderDataRequest";
import {GetBackendUnitResponse} from "../../../common/author-api/GetBackendUnitResponse";
import {UpdateBackendUnitRequest} from "../../../common/author-api/UpdateBackendUnitRequest";

export async function getBackendCourseList(): Promise<GetBackendCourseListResponse> {
    return await backendGet<GetBackendCourseListResponse>("getCourseList");
}

export async function getBackendCourseAndUnits(courseId: number): Promise<GetBackendCourseAndUnitsResponse> {
    return await backendGet<GetBackendCourseAndUnitsResponse>(`getCourseAndUnits/${courseId}`);
}

export async function updateBackendCourseHeaderData(courseId: number, request: UpdateCourseHeaderDataRequest): Promise<void> {
    await backendPost(`updateCourseHeaderData/${courseId}`, request);
}

export async function getBackendUnit(unitId: number): Promise<GetBackendUnitResponse> {
    return await backendGet<GetBackendUnitResponse>(`getUnit/${unitId}`);
}

export async function updateBackendUnitData(unitId: number, request: UpdateBackendUnitRequest): Promise<void> {
    await backendPost(`updateUnit/${unitId}`, request);
}