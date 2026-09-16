package com.backend.dto;

import java.util.ArrayList;
import java.util.List;

public class DashboardSummaryResponse {

    private String periodType; // monthly, weekly, yearly
    private List<PeriodSummary> summaries = new ArrayList<>();

    public String getPeriodType() {
        return periodType;
    }

    public void setPeriodType(String periodType) {
        this.periodType = periodType;
    }

    public List<PeriodSummary> getSummaries() {
        return summaries;
    }

    public void setSummaries(List<PeriodSummary> summaries) {
        this.summaries = summaries;
    }
}
