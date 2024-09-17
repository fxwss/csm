export class Memory {
  private data: Record<string, any> = {}

  public get<T>(key: string): T {
    return this.data[key]
  }

  public set<T>(key: string, value: T): void {
    this.data[key] = value
  }
}
