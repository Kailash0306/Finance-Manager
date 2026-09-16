package com.backend.util;

import com.backend.dto.UserResponse;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

/**
 * Resolves the currently authenticated user from the security context.
 */
public final class AuthUtil {

    private AuthUtil() {}

    /** Returns the current user's id, or null if not authenticated. */
    public static String currentUserId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || auth.getPrincipal() == null || !(auth.getPrincipal() instanceof UserResponse)) {
            return null;
        }
        return ((UserResponse) auth.getPrincipal()).getId();
    }

    /** Returns the current user, or null if not authenticated. */
    public static UserResponse currentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || auth.getPrincipal() == null || !(auth.getPrincipal() instanceof UserResponse)) {
            return null;
        }
        return (UserResponse) auth.getPrincipal();
    }
}
