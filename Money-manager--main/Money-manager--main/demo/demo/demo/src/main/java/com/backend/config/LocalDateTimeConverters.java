package com.backend.config;

import org.springframework.core.convert.converter.Converter;
import org.springframework.data.convert.ReadingConverter;
import org.springframework.data.convert.WritingConverter;

import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.Date;

/**
 * MongoDB converters: store as UTC (BSON Date), read/write in IST.
 * DB holds UTC instant; API and 12-hour check use IST.
 */
public final class LocalDateTimeConverters {

    public static final ZoneId IST = ZoneId.of("Asia/Kolkata");

    private static final DateTimeFormatter FORMATTER = DateTimeFormatter.ISO_LOCAL_DATE_TIME;

    /** Store LocalDateTime (IST) as BSON Date. */
    @WritingConverter
    public static enum LocalDateTimeToDate implements Converter<LocalDateTime, Date> {
        INSTANCE;

        @Override
        public Date convert(LocalDateTime source) {
            if (source == null) return null;
            return Date.from(source.atZone(IST).toInstant());
        }
    }

    /** Read BSON Date as LocalDateTime in IST. */
    @ReadingConverter
    public static enum DateToLocalDateTime implements Converter<Date, LocalDateTime> {
        INSTANCE;

        @Override
        public LocalDateTime convert(Date source) {
            if (source == null) return null;
            return LocalDateTime.ofInstant(source.toInstant(), IST);
        }
    }

    /** Read legacy string (e.g. "2026-02-06T19:30:00") if any old docs have it. */
    @ReadingConverter
    public static enum StringToLocalDateTime implements Converter<String, LocalDateTime> {
        INSTANCE;

        @Override
        public LocalDateTime convert(String source) {
            if (source == null || source.isBlank()) return null;
            return LocalDateTime.parse(source, FORMATTER);
        }
    }

    private LocalDateTimeConverters() {}
}
