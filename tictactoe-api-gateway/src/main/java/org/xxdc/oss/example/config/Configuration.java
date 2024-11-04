package org.xxdc.oss.example.config;

import com.google.protobuf.util.JsonFormat;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.enterprise.inject.Produces;

@ApplicationScoped
public class Configuration {

    @Produces
    public JsonFormat.Printer jsonPrinter() {
        return JsonFormat.printer()
            .includingDefaultValueFields()
            .preservingProtoFieldNames()
            .omittingInsignificantWhitespace();
    }

}
