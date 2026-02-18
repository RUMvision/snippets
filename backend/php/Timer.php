<?php
/*
usage:
```
Timer::start('app');

// do work

Timer::stop('app');

Timer::addTotalFromRequest();
Timer::addMemoryUsage();

header('Server-Timing: ' . Timer::toHeader());
```
*/

declare(strict_types=1);


final class Timer
{
    private static array $timers = [];
    private static int $memoryBaseline = 0;

    public static function init(): void
    {
        self::$memoryBaseline = memory_get_usage(true);

        if (!empty($_SERVER['REQUEST_TIME_FLOAT'])) {
            self::$timers['app-start'] = [
                'start' => (float) $_SERVER['REQUEST_TIME_FLOAT'],
                'stop'  => microtime(true),
            ];
        }
    }

    public static function start(string $key, ?string $description = null, ?float $startTime = null): void
    {
        if (self::$memoryBaseline === 0) {
            self::init();
        }

        self::$timers[$key] = [
            'start' => $startTime ?? microtime(true),
            'desc'  => $description,
        ];
    }

    public static function stop(string $key, ?string $description = null, ?float $stopTime = null): void
    {
        if (!isset(self::$timers[$key])) {
            return;
        }

        self::$timers[$key]['stop'] = $stopTime ?? microtime(true);

        if ($description !== null) {
            self::$timers[$key]['desc'] = $description;
        }
    }

    public static function reset(string $key, ?string $description = null): void
    {
        self::stop($key, $description);
        self::start($key, $description);
    }

    public static function describe(string $key, string $description): void
    {
		self::start($key, $description);
    }

    public static function getDuration(string $key): ?float
    {
        if (!isset(self::$timers[$key]['start'])) {
            return null;
        }

        $stop = self::$timers[$key]['stop'] ?? microtime(true);

        return $stop - self::$timers[$key]['start'];
    }

    public static function addMemoryUsage(): void
    {
        if (self::$memoryBaseline === 0) {
            self::init();
        }

        $peak = memory_get_peak_usage(true);
        $delta = $peak - self::$memoryBaseline;
		
		self::start('memory','usage=' . self::formatBytes($delta));
    }

    public static function addTotalFromRequest(): void
    {
        if (empty($_SERVER['REQUEST_TIME_FLOAT'])) {
            return;
        }

        self::$timers['total'] = [
            'start' => (float) $_SERVER['REQUEST_TIME_FLOAT'],
            'stop'  => microtime(true),
            'desc'  => self::$timers['total']['desc'] ?? null,
        ];
    }

    public static function toHeader(int $decimals=3): string
    {
        $metrics = [];

        foreach (self::$timers as $name => $timer) {

            if (!isset($timer['start'],$timer['stop']) && empty($timer['desc'])) {
                continue;
            }

            $metric = $name;

            if (!empty($timer['stop'])) {
                $metric .= sprintf(
					';dur=%.' . $decimals . 'f', 
					($timer['stop'] - $timer['start']) * 1000
				);
            }

            if (!empty($timer['desc'])) {
                $desc = self::escapeDescription($timer['desc']);
                $metric .= sprintf(
					';desc="%s"', 
					$desc
				);
            }

            $metrics[] = $metric;
        }

        return implode(', ', $metrics);
    }

    private static function escapeDescription(string $desc): string
    {
        return str_replace(
            ['"', "\r", "\n"],
            ['\"', '', ''],
            $desc
        );
    }

    private static function formatBytes(int $bytes): string
    {
        if ($bytes < 1024) {
            return $bytes . ' B';
        }

        $units = ['KB', 'MB', 'GB', 'TB'];
        $bytes /= 1024;

        foreach ($units as $unit) {
            if ($bytes < 1024) {
                return sprintf('%.2f %s', $bytes, $unit);
            }
            $bytes /= 1024;
        }

        return sprintf('%.2f PB', $bytes);
    }
}