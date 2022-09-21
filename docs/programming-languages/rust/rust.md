---
title: Rust
---

# [Rust](https://www.rust-lang.org/en-US/)

## Notes

### Concepts

#### Ownership

memory is managed in rust by the concept of ownership - no garbage collectors

#### Stack
the stack stores values in the order it gets them and removes the values in the opposite order, last in first out (LIFO)

adding data -> pushing onto the stack
removing data -> popping off the stack

data has to have a ***known***, ***fixed*** size

#### Heap
allocating on the heap/putting data on heap: request certain space -> os finds empty spot, marks it as used, returns pointer

pointer is a known fixed size, can be stored on stack, but to access data you have to follow the pointer

#### Comparison
Storing data: Pushing data to the stack is faster than allocating to the heap because the os does not have to search for a place to store the data. 

Allocating to the heap req more work as os has to find space & perform bookkeeping

Accessing data: in heap is slower than accessing data on the stack because the os has to follow the pointer to the data.

values passed in function parameters are stored on the stack, after function execution, values are popped off the stack

## Links

- [The Book](https://doc.rust-lang.org/book/)
- [Building DeFi with Rust and Ethereum (Providers and Signers)](https://hannydevelop.hashnode.dev/building-defi-with-rust-and-ethereum-providers-and-signers)
- [The Ultimate Guide to self, Self in Rust](https://hannydevelop.hashnode.dev/the-ultimate-guide-to-self-self-in-rust)
- [Interactive Rust Book](https://rust-book.cs.brown.edu/ch10-03-lifetime-syntax.html)

## More specific stuff
- [Exporting ECDSA key pair](https://stackoverflow.com/questions/73113438/how-can-i-export-to-store-an-ecdsa-key-pair-in-rust)
- [Optional arguments in rust](https://www.kirillvasiltsov.com/writing/optional-arguments-in-rust/)