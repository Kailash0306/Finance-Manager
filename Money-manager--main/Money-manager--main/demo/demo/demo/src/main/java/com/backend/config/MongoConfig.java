package com.backend.config;

import com.mongodb.client.MongoClient;
import com.mongodb.client.MongoClients;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.mongodb.MongoDatabaseFactory;
import org.springframework.data.mongodb.core.SimpleMongoClientDatabaseFactory;
import org.springframework.data.mongodb.core.convert.MongoCustomConversions;

import java.util.Arrays;

import static com.backend.config.LocalDateTimeConverters.DateToLocalDateTime;
import static com.backend.config.LocalDateTimeConverters.LocalDateTimeToDate;
import static com.backend.config.LocalDateTimeConverters.StringToLocalDateTime;

@Configuration
public class MongoConfig {

    private static final String DEFAULT_URI =
            "mongodb+srv://kailashuser:Kailash@1974@cluster0.9n5ald3.mongodb.net/money_manager?retryWrites=true&w=majority&appName=Cluster0"
    private static final String DEFAULT_DATABASE = "money_manager";

    @Value("${spring.data.mongodb.uri:}")
    private String uri;

    @Value("${spring.data.mongodb.database:" + DEFAULT_DATABASE + "}")
    private String database;

    @Bean
    public MongoClient mongoClient() {
        String connectionUri = (uri != null && !uri.isBlank()) ? uri : DEFAULT_URI;
        return MongoClients.create(connectionUri);
    }

    /**
     * Use money_manager (or configured database) explicitly so the app never falls back to "test".
     */
    @Bean
    public MongoDatabaseFactory mongoDatabaseFactory(MongoClient mongoClient) {
        String dbName = (database != null && !database.isBlank()) ? database : DEFAULT_DATABASE;
        return new SimpleMongoClientDatabaseFactory(mongoClient, dbName);
    }

    /**
     * Custom conversions: LocalDateTime (IST) stored as BSON Date.
     */
    @Bean
    public MongoCustomConversions customConversions() {
        return new MongoCustomConversions(Arrays.asList(
                LocalDateTimeToDate.INSTANCE,
                DateToLocalDateTime.INSTANCE,
                StringToLocalDateTime.INSTANCE
        ));
    }
}
