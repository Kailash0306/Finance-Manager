package com.backend.util;

import java.math.BigDecimal;
import java.text.NumberFormat;
import java.util.Locale;

/**
 * Format money with Indian Rupee symbol (₹).
 */
public final class MoneyFormat {

    private static final NumberFormat INDIAN_RUPEE = NumberFormat.getCurrencyInstance(new Locale("en", "IN"));

    private MoneyFormat() {}

    /**
     * Returns amount formatted with rupee symbol, e.g. "₹1,234.56" or "₹0.00".
     */
    public static String formatRupees(BigDecimal amount) {
        if (amount == null) {
            return "₹0.00";
        }
        return INDIAN_RUPEE.format(amount);
    }
}
