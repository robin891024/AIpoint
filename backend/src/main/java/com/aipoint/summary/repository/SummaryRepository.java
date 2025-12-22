package com.aipoint.summary.repository;

import com.aipoint.summary.model.entity.SummaryRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * 摘要記錄存取層
 */
@Repository
public interface SummaryRepository extends JpaRepository<SummaryRecord, Long> {
    /**
     * 獲取所有紀錄並按建立時間倒序排列
     */
    List<SummaryRecord> findAllByOrderByCreatedAtDesc();
}
