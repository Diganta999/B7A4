type TMeta={
    page: number;
    limit: number;
    total: number;
}

interface TResponse<T> {
    success: boolean;
    statusCode: number;
    message: string;
    data?: T;
    meta?: TMeta;
}

export const sendResponse = <T>(res: any, response: TResponse<T>) => {
    
    res.status(response.statusCode).json({
      success: response.success,
      statusCode: response.statusCode,
      message: response.message,
      data: response.data || null,
      meta: response.meta || null
    }); 
};