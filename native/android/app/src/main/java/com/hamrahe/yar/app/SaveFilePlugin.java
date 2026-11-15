
package com.hamrahe.yar.app;

import android.app.Activity;
import android.content.Intent;
import android.database.Cursor;
import android.net.Uri;
import android.provider.DocumentsContract;
import android.provider.OpenableColumns;
import android.util.Base64;

import androidx.activity.result.ActivityResult;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.ActivityCallback;
import com.getcapacitor.annotation.CapacitorPlugin;

import java.io.OutputStream;

@CapacitorPlugin(name = "SaveFile")
public class SaveFilePlugin extends Plugin {

    @PluginMethod
    public void saveFile(PluginCall call) {
        String data = call.getString("data");
        String fileName = call.getString("fileName", "backup.json");
        String mimeType = call.getString("mimeType", "application/json");

        if (data == null || data.isEmpty()) {
            call.reject("File data is empty");
            return;
        }

        Intent intent = new Intent(Intent.ACTION_CREATE_DOCUMENT);
        intent.addCategory(Intent.CATEGORY_OPENABLE);
        intent.setType(mimeType);
        intent.putExtra(Intent.EXTRA_TITLE, fileName);

        startActivityForResult(call, intent, "handleSaveResult");
    }

    @ActivityCallback
    private void handleSaveResult(PluginCall call, ActivityResult result) {
        if (call == null) return;

        if (result.getResultCode() != Activity.RESULT_OK
                || result.getData() == null
                || result.getData().getData() == null) {
            JSObject response = new JSObject();
            response.put("cancelled", true);
            call.resolve(response);
            return;
        }

        Uri uri = result.getData().getData();

        try {
            String data = call.getString("data");
            String fileName = call.getString("fileName", "backup.json");

            if (data == null) {
                call.reject("File data is missing");
                return;
            }

            if (data.startsWith("data:") && data.contains(",")) {
                data = data.substring(data.indexOf(",") + 1);
            }

            byte[] bytes = Base64.decode(data, Base64.DEFAULT);

            try (OutputStream output =
                         getContext().getContentResolver().openOutputStream(uri)) {
                if (output == null) {
                    throw new Exception("Cannot open selected file");
                }
                output.write(bytes);
                output.flush();
            }

            String savedName = fileName;
            try (Cursor cursor = getContext().getContentResolver()
                    .query(uri, null, null, null, null)) {
                if (cursor != null && cursor.moveToFirst()) {
                    int index = cursor.getColumnIndex(OpenableColumns.DISPLAY_NAME);
                    if (index >= 0) savedName = cursor.getString(index);
                }
            }

            String location = "محل انتخاب‌شده در فایل‌گزین گوشی";
            try {
                String documentId = DocumentsContract.getDocumentId(uri);
                if (documentId.contains(":")) {
                    location = documentId.substring(documentId.indexOf(':') + 1);
                }
            } catch (Exception ignored) {
                // Some document providers do not expose a document ID.
            }

            JSObject response = new JSObject();
            response.put("cancelled", false);
            response.put("fileName", savedName);
            response.put("location", location);
            response.put("uri", uri.toString());

            call.resolve(response);

        } catch (Exception error) {
            call.reject("Could not save file", error);
        }
    }
}
