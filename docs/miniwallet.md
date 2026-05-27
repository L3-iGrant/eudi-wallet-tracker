# A Mini Wallet

On the road to the fully-fledged EUDI Wallet, it may be interesting to give a concrete definition to the concept of Mini Wallet and track what countries have a corresponding implementation in production

## Intro

The Mini Wallet has been mentioned several times in the past while the EUDI Wallet's definition was evolving. With the prospect of releasing different national implementations of apps capable of providing age attestations, it may be interesting to define more precisely the requirements for providing an interoperable Mini Wallet capable of submitting age attestations verifiable across the EU.
The intention is mainly to define a Minimum Viable Product for a Mini Wallet : MVP4MW

## Requirements
A very early definition could consist of, implementing a wallet that would not meet all the requirements to be certifiable as an EUDI Wallet, but that would provide the following:
- it can handle mdoc attestations
- it accepts openid4vp 1.0 to present the attestations it holds
- it can receive a substantial attestation of identity (e.g. a PhotoID)
- it would accept web certificates to identify issuers (displaying the common name if it is accessible with a browser) 
