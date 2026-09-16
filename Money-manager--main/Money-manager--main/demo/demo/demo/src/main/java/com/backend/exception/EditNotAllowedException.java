package com.backend.exception;

public class EditNotAllowedException extends RuntimeException {

    public EditNotAllowedException(String message) {
        super(message);
    }
}
