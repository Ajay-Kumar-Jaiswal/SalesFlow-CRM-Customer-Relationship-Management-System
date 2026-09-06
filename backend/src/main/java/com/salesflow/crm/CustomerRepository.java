package com.salesflow.crm;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface CustomerRepository extends JpaRepository<Customer, Long> {

    // Case-insensitive partial match search by name
    List<Customer> findByNameContainingIgnoreCase(String name);

    // Filter customers by status
    List<Customer> findByStatus(CustomerStatus status);
}
