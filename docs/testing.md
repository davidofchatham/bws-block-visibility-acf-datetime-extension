# Testing

Test on the local wp-litespeed testbed (https://testbed.test/). Its plugin directory is a symlink to this repo, so there is nothing to sync; run `npm run build` after JS changes. It has Block Visibility and ACF Pro installed.

## Checklist

1. Clear all caches (object cache, page cache).
2. Confirm dependencies are active (Block Visibility 3.0+, ACF).
3. Confirm ACF fields exist with type `date_picker` or `date_time_picker`.
4. Create a test block with an ACF Date/Time visibility rule.
5. Check the frontend with various date values and operators.
6. Check the error log for PHP notices and warnings.

## Debug logging

To confirm the frontend filter is called, add temporary logging at the top of `acf_datetime_test()` in `includes/frontend/visibility-test.php`, and remove it afterward:

```php
error_log( 'ACF DateTime test called' );
error_log( 'Controls: ' . print_r( $controls, true ) );
```
