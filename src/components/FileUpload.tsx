import React from "react";

interface FileUploadProps {
    onUpload: (file: File) => void;
}

const FileUpload: React.FC<FileUploadProps> = ({ onUpload }) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            onUpload(file);
        }
    };

    return (
        <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
                Envie o arquivo Excel
            </label>
            <input
                type="file"
                accept=".xlsx"
                onChange={handleChange}
                className="border rounded px-3 py-2 w-full"
            />
        </div>
    );
};

export default FileUpload;
