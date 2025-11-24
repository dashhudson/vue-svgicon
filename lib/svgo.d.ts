declare module 'svgo' {
    export interface OptimizeResult {
        data: string
        info: {
            width?: string
            height?: string
            [key: string]: any
        }
    }
    export function optimize(input: string, config?: any): OptimizeResult
}

