import { createWriteStream, WriteStream } from 'fs';
import { format } from 'date-fns';
import type { Coordinate } from '../types/common';

export type LogLevel = 'info' | 'warn' | 'error' | 'debug';

export interface Logger {
  log(level: LogLevel, message: string, context?: Record<string, unknown>): void;
  logPlaceShip(context: Record<string, unknown>): void;
  logShot(context: Record<string, unknown>): void;
  logEnemyShot(context: Record<string, unknown>): void;
  logGameOver(context: Record<string, unknown>): void;
  logEnemyShip(context: Record<string, unknown>): void;
}

export class FileLogger implements Logger {
  private readonly filePath: string;
  private readonly stream: WriteStream;

  constructor(filePath: string) {
    this.filePath = filePath;
    this.stream = createWriteStream(this.filePath, { flags: 'a' });
  }

  private formatTimestamp(): string {
    return format(new Date(), 'HH:mm:ss.SSS');
  }

  private writeLine(line: string): void {
    this.stream.write(line + '\n');
  }

  log(level: LogLevel, message: string, context?: Record<string, unknown>): void {
    let ctx = '';
    if (context && Object.keys(context).length > 0) {
      ctx =
        ' ' +
        Object.entries(context)
          .map(([key, value]) => `${key}=${value}`)
          .join(' ');
    }
    const out = `${this.formatTimestamp()} ${level}: ${message}${ctx}`;
    this.writeLine(out);
  }

  logPlaceShip(context: Record<string, unknown>): void {
    const size = context.size;
    const pos = context.pos as Coordinate;
    const dir = context.dir;
    const out = `${this.formatTimestamp()} place-ship: size=${size} pos=(${pos.x},${pos.y}) dir=${dir}`;
    this.writeLine(out);
  }

  logShot(context: Record<string, unknown>): void {
    const pos = context.pos as Coordinate;
    const result = context.result;
    let line = `${this.formatTimestamp()} shot: pos=(${pos.x},${pos.y}) result=${result}`;
    if ('ship-size' in context && context['ship-size'] !== undefined) {
      line += ` ship-size=${context['ship-size']}`;
    }
    this.writeLine(line);
  }

  logEnemyShot(context: Record<string, unknown>): void {
    const pos = context.pos as Coordinate;
    const result = context.result;
    let line = `${this.formatTimestamp()} enemy-shot: pos=(${pos.x},${pos.y}) result=${result}`;
    if ('ship-size' in context && context['ship-size'] !== undefined) {
      line += ` ship-size=${context['ship-size']}`;
    }
    this.writeLine(line);
  }

  logGameOver(context: Record<string, unknown>): void {
    // result=win total-shots=47 enemy-total-shots=52
    const result = context.result;
    const totalShots = context['total-shots'];
    const enemyTotalShots = context['enemy-total-shots'];
    const line = `${this.formatTimestamp()} game-over: result=${result} total-shots=${totalShots} enemy-total-shots=${enemyTotalShots}`;
    this.writeLine(line);
  }

  logEnemyShip(context: Record<string, unknown>): void {
    // size=4 pos=(2,3) dir=vertical
    const size = context.size;
    const pos = context.pos as Coordinate;
    const dir = context.dir;
    const line = `${this.formatTimestamp()} enemy-ship: size=${size} pos=(${pos.x},${pos.y}) dir=${dir}`;
    this.writeLine(line);
  }
}
