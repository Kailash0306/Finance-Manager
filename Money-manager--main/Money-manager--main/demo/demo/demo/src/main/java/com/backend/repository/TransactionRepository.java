package com.backend.repository;

import com.backend.model.Division;
import com.backend.model.Transaction;
import com.backend.model.TransactionType;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;

import java.time.LocalDateTime;
import java.util.List;

public interface TransactionRepository extends MongoRepository<Transaction, String> {

    List<Transaction> findByUserIdAndDateTimeBetweenOrderByDateTimeDesc(String userId, LocalDateTime start, LocalDateTime end);

    List<Transaction> findByUserIdAndTypeAndDateTimeBetweenOrderByDateTimeDesc(String userId, TransactionType type, LocalDateTime start, LocalDateTime end);

    List<Transaction> findByUserIdAndDivisionAndDateTimeBetweenOrderByDateTimeDesc(String userId, Division division, LocalDateTime start, LocalDateTime end);

    List<Transaction> findByUserIdAndCategoryAndDateTimeBetweenOrderByDateTimeDesc(String userId, String category, LocalDateTime start, LocalDateTime end);

    List<Transaction> findByUserIdAndTypeAndDivisionAndDateTimeBetweenOrderByDateTimeDesc(String userId, TransactionType type, Division division, LocalDateTime start, LocalDateTime end);

    List<Transaction> findByUserIdAndTransferId(String userId, String transferId);

    @Query("{ 'userId' : ?0, 'dateTime' : { $gte: ?1, $lte: ?2 } }")
    List<Transaction> findInDateRange(String userId, LocalDateTime start, LocalDateTime end);
}
