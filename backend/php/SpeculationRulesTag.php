<?php

$speculation = $_SERVER['HTTP_SEC_SPECULATION_TAGS'] ?? '';

if ( !empty($speculation) ) {
	// Remove surrounding quotes and prevent CR/LF header injection.
	$speculation = trim($speculation, "\"' \t\n\r\0\x0B");
	$speculation = str_replace(["\r", "\n"], '', $speculation);

	// Restrict the value to a safe character set for a Server-Timing description.
	$speculation = preg_replace('/[^a-zA-Z0-9._:\/+\-]/', '', $speculation);
}

// Quote the Server-Timing description safely.
header(
	'Server-Timing: speculation;desc="' . addcslashes( $speculation ?: 'none', "\\\"") . '"',
	false
);

/**
 * // When using Timer.php:
 * Timer::describe( 'speculation', $speculation ?: 'none' );
 * header('Server-Timing: ' . Timer::toHeader());
 */